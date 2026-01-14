import { Injectable, ConflictException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { MailService } from '../mail/mail.service';
import { CreateAccountDto, CreateStudentDto } from './dto';
import * as bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';

@Injectable()
export class AccountsService {
  constructor(
    private db: DatabaseService,
    private mailService: MailService,
  ) { }

  // Récupérer tous les secrétaires
  async getSecretaires(userRole: string) {
    // Utilise la connexion correspondant au rôle de l'utilisateur connecté
    const result = await this.db.query(
      userRole, // Le rôle vient du JWT !
      `SELECT 
        s.id_utilisateur,
        s.nom,
        s.prenom,
        u.mail,
        u.num_tel,
        u.login
      FROM Secretaire s
      JOIN Utilisateur u ON s.id_utilisateur = u.id_utilisateur
      ORDER BY s.nom, s.prenom`
    );
    return result.rows;
  }

  // Récupérer tous les enseignants
  async getEnseignants(userRole: string) {
    const result = await this.db.query(
      userRole,
      `SELECT 
        e.id_utilisateur,
        e.nom,
        e.prenom,
        u.mail,
        u.num_tel,
        u.login
      FROM EnseignantResponsable e
      JOIN Utilisateur u ON e.id_utilisateur = u.id_utilisateur
      ORDER BY e.nom, e.prenom`
    );
    return result.rows;
  }

  // Créer un secrétaire
  async createSecretaire(userRole: string, dto: CreateAccountDto) {
    return await this.db.transaction(userRole, async (client) => {
      const loginResult = await client.query(
        'SELECT generate_login($1) as login',
        [dto.lastName]
      );
      const login = loginResult.rows[0].login;

      const checkMail = await client.query(
        'SELECT 1 FROM Utilisateur WHERE mail = $1',
        [dto.mail]
      );
      if (checkMail.rows.length > 0) {
        throw new ConflictException('Email déjà utilisé');
      }

      const password = nanoid(12);
      const hashedPassword = await bcrypt.hash(password, 10);

      await client.query(
        'INSERT INTO Compte (login, mot_de_passe) VALUES ($1, $2)',
        [login, hashedPassword]
      );

      const userResult = await client.query(
        'INSERT INTO Utilisateur (mail, num_tel, login) VALUES ($1, $2, $3) RETURNING id_utilisateur',
        [dto.mail, dto.phone, login]
      );
      const idUtilisateur = userResult.rows[0].id_utilisateur;

      // Crée le secrétaire
      await client.query(
        'INSERT INTO Secretaire (id_utilisateur, nom, prenom) VALUES ($1, $2, $3)',
        [idUtilisateur, dto.lastName, dto.firstName]
      );

      return { login, password, idUtilisateur };
    }).then(async (result) => {
      try {
        await this.mailService.sendAccountCredentials(dto, result.password, result.login);
      } catch (error) {
        console.error('Erreur envoi email:', error);
      }

      return {
        message: 'Secrétaire créé avec succès',
        login: result.login,
      };
    });
  }


  async changePassword(role: string, userId: number, newPassword: string) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const result = await this.db.query(
      role,
      `
    SELECT login
    FROM Utilisateur
    WHERE id_utilisateur = $1
    `,
      [userId]
    );

    if (result.rows.length === 0) {
      throw new Error('Utilisateur introuvable');
    }

    const login = result.rows[0].login;

    await this.db.query(
      role,
      `
      UPDATE Compte
      SET mot_de_passe = $1
      WHERE login = $2
      `,
      [hashedPassword, login]
    );
  }

  async getMyProfile(role: string, userId: number) {
    let roleQuery = '';

    switch (role) {
      case 'etudiant':
        roleQuery = `
        SELECT 
          u.id_utilisateur,
          u.mail,
          u.num_tel,
          e.nom,
          e.prenom,
          e.niveau_etu,
          e.statut_etu,
          e.date_naissance_etu::text
        FROM Utilisateur u
        JOIN Etudiant e ON e.id_utilisateur = u.id_utilisateur
        WHERE u.id_utilisateur = $1
      `;
        break;

      case 'enseignant':
        roleQuery = `
        SELECT 
          u.id_utilisateur,
          u.mail,
          u.num_tel,
          e.nom,
          e.prenom
        FROM Utilisateur u
        JOIN EnseignantResponsable e ON e.id_utilisateur = u.id_utilisateur
        WHERE u.id_utilisateur = $1
      `;
        break;

      case 'secretaire':
        roleQuery = `
        SELECT 
          u.id_utilisateur,
          u.mail,
          u.num_tel,
          s.nom,
          s.prenom
        FROM Utilisateur u
        JOIN Secretaire s ON s.id_utilisateur = u.id_utilisateur
        WHERE u.id_utilisateur = $1
      `;
        break;

      case 'entreprise':
        roleQuery = `
        SELECT 
          u.id_utilisateur,
          u.mail,
          u.num_tel,
          e.raison_sociale,
          e.domaine_entreprise,
          e.adresse_entreprise,
          e.siret_entreprise
        FROM Utilisateur u
        JOIN Entreprise e ON e.id_utilisateur = u.id_utilisateur
        WHERE u.id_utilisateur = $1
      `;
        break;

      case 'admin':
        roleQuery = `
        SELECT
          u.id_utilisateur,
          u.mail,
          u.num_tel
        FROM Utilisateur u
        JOIN Administrateur a ON a.id_utilisateur = u.id_utilisateur
        WHERE u.id_utilisateur = $1
      `;
        break;

      default:
        throw new Error('Rôle non supporté');
    }

    const result = await this.db.query(role, roleQuery, [userId]);
    console.log(result.rows);
    return {
      role,
      ...result.rows[0],
    };
  }

  async updateMyProfile(role: string, userId: number, data: any) {
    return this.db.transaction(role, async (client) => {

      // Infos communes (admin inclus)
      if (data.num_tel) {
        await client.query(
          `
        UPDATE Utilisateur
        SET num_tel = $1
        WHERE id_utilisateur = $2
        `,
          [data.num_tel, userId],
        );
      }

      switch (role) {
        case 'etudiant':
          await client.query(
            `
          UPDATE Etudiant
          SET nom = $1,
              prenom = $2,
              statut_etu = $3,
              date_naissance_etu = $4
          WHERE id_utilisateur = $5
          `,
            [data.nom, data.prenom, data.statut_etu, data.date_naissance_etu, userId],
          );
          break;

        case 'enseignant':
          await client.query(
            `
          UPDATE EnseignantResponsable
          SET nom = $1,
              prenom = $2
          WHERE id_utilisateur = $3
          `,
            [data.nom, data.prenom, userId],
          );
          break;

        case 'secretaire':
          await client.query(
            `
          UPDATE Secretaire
          SET nom = $1,
              prenom = $2
          WHERE id_utilisateur = $3
          `,
            [data.nom, data.prenom, userId],
          );
          break;

        case 'entreprise':
          await client.query(
            `
          UPDATE Entreprise
          SET raison_sociale = $1,
              domaine_entreprise = $2,
              adresse_entreprise = $3
          WHERE id_utilisateur = $4
          `,
            [
              data.raison_sociale,
              data.domaine_entreprise,
              data.adresse_entreprise,
              userId,
            ],
          );
          break;

        case 'admin':
          // rien d’autre à modifier que Utilisateur
          break;
      }

      return { message: 'Profil mis à jour' };
    });
  }

  // Créer un enseignant
  async createEnseignant(userRole: string, dto: CreateAccountDto) {
    return await this.db.transaction(userRole, async (client) => {
      const loginResult = await client.query(
        'SELECT generate_login($1) as login',
        [dto.lastName]
      );
      const login = loginResult.rows[0].login;

      const checkMail = await client.query(
        'SELECT 1 FROM Utilisateur WHERE mail = $1',
        [dto.mail]
      );
      if (checkMail.rows.length > 0) {
        throw new ConflictException('Email déjà utilisé');
      }

      const password = nanoid(12);
      const hashedPassword = await bcrypt.hash(password, 10);

      await client.query(
        'INSERT INTO Compte (login, mot_de_passe) VALUES ($1, $2)',
        [login, hashedPassword]
      );

      const userResult = await client.query(
        'INSERT INTO Utilisateur (mail, num_tel, login) VALUES ($1, $2, $3) RETURNING id_utilisateur',
        [dto.mail, dto.phone, login]
      );
      const idUtilisateur = userResult.rows[0].id_utilisateur;

      await client.query(
        'INSERT INTO EnseignantResponsable (id_utilisateur, nom, prenom) VALUES ($1, $2, $3)',
        [idUtilisateur, dto.lastName, dto.firstName]
      );

      return { login, password, idUtilisateur };
    }).then(async (result) => {
      try {
        await this.mailService.sendAccountCredentials(
          dto, result.password, result.login
        );
      } catch (error) {
        console.error('Erreur envoi email:', error);
      }

      return {
        message: 'Enseignant créé avec succès',
        login: result.login,
      };
    });
  }

  async getEtudiants(userRole: string) {
    const result = await this.db.query(
      userRole,
      `SELECT 
        e.id_utilisateur,
        e.nom,
        e.prenom,
        e.niveau_etu,
        e.statut_etu,
        u.mail,
        u.num_tel,
        u.login
      FROM Etudiant e
      JOIN Utilisateur u ON e.id_utilisateur = u.id_utilisateur
      ORDER BY e.nom, e.prenom`
    );
    return result.rows;
  }

  async createEtudiant(userRole: string, dto: CreateStudentDto) {
    return await this.db.transaction(userRole, async (client) => {
      const loginResult = await client.query(
        'SELECT generate_login($1) as login',
        [dto.lastName]
      );
      const login = loginResult.rows[0].login;
      const checkMail = await client.query(
        'SELECT 1 FROM Utilisateur WHERE mail = $1',
        [dto.mail]
      );

      if (checkMail.rows.length > 0) {
        throw new ConflictException('Email déjà utilisé');
      }

      const password = nanoid(12);
      const hashedPassword = await bcrypt.hash(password, 10);
      await client.query(
        'INSERT INTO Compte (login, mot_de_passe) VALUES ($1, $2)',
        [login, hashedPassword]
      );
      const userResult = await client.query(
        'INSERT INTO Utilisateur (mail, num_tel, login) VALUES ($1, $2, $3) RETURNING id_utilisateur',
        [dto.mail, dto.phone, login]
      );
      const idUtilisateur = userResult.rows[0].id_utilisateur;
      await client.query(
        'INSERT INTO Etudiant (id_utilisateur, nom, prenom, date_naissance_etu, niveau_etu) VALUES ($1, $2, $3, $4, $5)',
        [idUtilisateur, dto.lastName, dto.firstName, dto.birthDate, dto.level]
      );

      return { login, password, idUtilisateur };
    }).then(async (result) => {
      try {
        await this.mailService.sendAccountCredentials(
          dto, result.password, result.login
        );
      } catch (error) {
        console.error('Erreur envoi email:', error);
      }
      return {
        message: 'Étudiant créé avec succès',
        login: result.login,
      };
    });
  }
}