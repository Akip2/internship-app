import { Injectable, ConflictException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { MailService } from '../mail/mail.service';
import { CreateAccountDto, CreateStudentDto, PasswordChangeDto } from './dto';
import * as bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';

export type User = { role: string; id: number };

@Injectable()
export class AccountsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly mailService: MailService,
  ) { }

  // --------------------- UTILISATEURS ---------------------

  async updateStudentBySecretaire(secretaire: User, data: any) {
    const client = await this.db.getClientWithUserId(secretaire.role, secretaire.id);
    try {
      await client.query('BEGIN');

      // Mise à jour Utilisateur
      await client.query(
        `UPDATE Utilisateur
       SET mail = $1,
           num_tel = $2
       WHERE id_utilisateur = $3`,
        [data.mail, data.phone, data.id_utilisateur]
      );

      // Mise à jour Etudiant
      await client.query(
        `UPDATE Etudiant
       SET nom = $1,
           prenom = $2,
           date_naissance_etu = $3,
           niveau_etu = $4
       WHERE id_utilisateur = $5`,
        [data.lastName, data.firstName, data.birthDate, data.level, data.id_utilisateur]
      );

      await client.query('COMMIT');
      return { message: 'Étudiant mis à jour avec succès' };
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  async getMyProfile(user: User) {
    const client = await this.db.getClientWithUserId(user.role, user.id);
    try {
      let query = '';
      switch (user.role) {
        case 'etudiant':
          query = `
            SELECT u.id_utilisateur, u.mail, u.num_tel, e.nom, e.prenom,
                   e.niveau_etu, e.statut_etu, e.date_naissance_etu::text, e.visibilite_infos
            FROM Utilisateur u
            JOIN Etudiant e ON e.id_utilisateur = u.id_utilisateur
            WHERE u.id_utilisateur = $1
          `;
          break;
        case 'enseignant':
          query = `
            SELECT u.id_utilisateur, u.mail, u.num_tel, e.nom, e.prenom
            FROM Utilisateur u
            JOIN EnseignantResponsable e ON e.id_utilisateur = u.id_utilisateur
            WHERE u.id_utilisateur = $1
          `;
          break;
        case 'secretaire':
          query = `
            SELECT u.id_utilisateur, u.mail, u.num_tel, s.nom, s.prenom
            FROM Utilisateur u
            JOIN Secretaire s ON s.id_utilisateur = u.id_utilisateur
            WHERE u.id_utilisateur = $1
          `;
          break;
        case 'entreprise':
          query = `
            SELECT u.id_utilisateur, u.mail, u.num_tel, e.raison_sociale,
                   e.domaine_entreprise, e.adresse_entreprise, e.siret_entreprise
            FROM Utilisateur u
            JOIN Entreprise e ON e.id_utilisateur = u.id_utilisateur
            WHERE u.id_utilisateur = $1
          `;
          break;
        case 'admin':
          query = `
            SELECT u.id_utilisateur, u.mail, u.num_tel
            FROM Utilisateur u
            JOIN Administrateur a ON a.id_utilisateur = u.id_utilisateur
            WHERE u.id_utilisateur = $1
          `;
          break;
        default:
          throw new Error('Rôle non supporté');
      }
      const res = await client.query(query, [user.id]);
      return { role: user.role, ...res.rows[0] };
    } finally {
      client.release();
    }
  }

  async updateMyProfile(user: User, data: any) {
    const client = await this.db.getClientWithUserId(user.role, user.id);
    try {
      await client.query('BEGIN');

      if (data.num_tel) {
        await client.query(
          `UPDATE Utilisateur SET num_tel = $1, mail= $2 WHERE id_utilisateur = $3`,
          [data.num_tel, data.mail, user.id]
        );
      }

      switch (user.role) {
        case 'etudiant':
          await client.query(
            `UPDATE Etudiant
             SET nom = $1, prenom = $2, statut_etu = $3, date_naissance_etu = $4, visibilite_infos = $5
             WHERE id_utilisateur = $6`,
            [data.nom, data.prenom, data.statut_etu, data.date_naissance_etu, data.visibilite_infos, user.id]
          );
          break;
        case 'enseignant':
          await client.query(
            `UPDATE EnseignantResponsable SET nom = $1, prenom = $2 WHERE id_utilisateur = $3`,
            [data.nom, data.prenom, user.id]
          );
          break;
        case 'secretaire':
          await client.query(
            `UPDATE Secretaire SET nom = $1, prenom = $2 WHERE id_utilisateur = $3`,
            [data.nom, data.prenom, user.id]
          );
          break;
        case 'entreprise':
          await client.query(
            `UPDATE Entreprise
             SET raison_sociale = $1, domaine_entreprise = $2, adresse_entreprise = $3
             WHERE id_utilisateur = $4`,
            [data.raison_sociale, data.domaine_entreprise, data.adresse_entreprise, user.id]
          );
          break;
        case 'admin':
          // rien à faire pour l’instant
          break;
      }

      await client.query('COMMIT');
      return { message: 'Profil mis à jour' };
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  async changePassword(user: User, newPassword: string) {
    const client = await this.db.getClientWithUserId(user.role, user.id);
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    try {
      const res = await client.query(
        `SELECT login FROM Utilisateur WHERE id_utilisateur = $1`,
        [user.id]
      );
      if (res.rows.length === 0) throw new Error('Utilisateur introuvable');

      await client.query(
        `UPDATE Compte SET mot_de_passe = $1 WHERE login = $2`,
        [hashedPassword, res.rows[0].login]
      );
    } finally {
      client.release();
    }
  }

  // --------------------- LISTES ---------------------

  async getSecretaires(user: User) {
    const client = await this.db.getClientWithUserId(user.role, user.id);
    try {
      const res = await client.query(`
        SELECT s.id_utilisateur, s.nom, s.prenom, u.mail, u.num_tel, u.login
        FROM Secretaire s
        JOIN Utilisateur u ON s.id_utilisateur = u.id_utilisateur
        ORDER BY s.nom, s.prenom
      `);
      return res.rows;
    } finally {
      client.release();
    }
  }

  async getEnseignants(user: User) {
    const client = await this.db.getClientWithUserId(user.role, user.id);
    try {
      const res = await client.query(`
        SELECT e.id_utilisateur, e.nom, e.prenom, u.mail, u.num_tel, u.login
        FROM EnseignantResponsable e
        JOIN Utilisateur u ON e.id_utilisateur = u.id_utilisateur
        ORDER BY e.nom, e.prenom
      `);
      return res.rows;
    } finally {
      client.release();
    }
  }

  async getEtudiants(user: User) {
    const client = await this.db.getClientWithUserId(user.role, user.id);
    try {
      const res = await client.query(`
        SELECT e.id_utilisateur, e.nom, e.prenom, e.niveau_etu, e.statut_etu, e.visibilite_infos, e.date_naissance_etu::text,
               u.mail, u.num_tel, u.login
        FROM Etudiant e
        JOIN Utilisateur u ON e.id_utilisateur = u.id_utilisateur
        ORDER BY e.nom, e.prenom
      `);
      return res.rows;
    } finally {
      client.release();
    }
  }

  // --------------------- CREATION ---------------------

  async createSecretaire(user: User, dto: CreateAccountDto) {
    const client = await this.db.getClientWithUserId(user.role, user.id);
    try {
      await client.query('BEGIN');

      const loginRes = await client.query('SELECT generate_login($1) as login', [dto.lastName]);
      const login = loginRes.rows[0].login;

      const checkMail = await client.query('SELECT 1 FROM Utilisateur WHERE mail = $1', [dto.mail]);
      if (checkMail.rows.length > 0) throw new ConflictException('Email déjà utilisé');

      const password = nanoid(12);
      const hashedPassword = await bcrypt.hash(password, 10);

      await client.query('INSERT INTO Compte (login, mot_de_passe) VALUES ($1, $2)', [login, hashedPassword]);

      const userRes = await client.query(
        'INSERT INTO Utilisateur (mail, num_tel, login) VALUES ($1, $2, $3) RETURNING id_utilisateur',
        [dto.mail, dto.phone, login]
      );
      const idUtilisateur = userRes.rows[0].id_utilisateur;

      await client.query('INSERT INTO Secretaire (id_utilisateur, nom, prenom) VALUES ($1, $2, $3)',
        [idUtilisateur, dto.lastName, dto.firstName]);

      await client.query('COMMIT');

      try {
        await this.mailService.sendAccountCredentials(dto, password, login);
      } catch (e) {
        console.error('Erreur envoi email:', e);
      }

      return { message: 'Secrétaire créé avec succès', login };
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  async createEnseignant(user: User, dto: CreateAccountDto) {
    const client = await this.db.getClientWithUserId(user.role, user.id);
    try {
      await client.query('BEGIN');

      const loginRes = await client.query('SELECT generate_login($1) as login', [dto.lastName]);
      const login = loginRes.rows[0].login;

      const checkMail = await client.query('SELECT 1 FROM Utilisateur WHERE mail = $1', [dto.mail]);
      if (checkMail.rows.length > 0) throw new ConflictException('Email déjà utilisé');

      const password = nanoid(12);
      const hashedPassword = await bcrypt.hash(password, 10);

      await client.query('INSERT INTO Compte (login, mot_de_passe) VALUES ($1, $2)', [login, hashedPassword]);

      const userRes = await client.query(
        'INSERT INTO Utilisateur (mail, num_tel, login) VALUES ($1, $2, $3) RETURNING id_utilisateur',
        [dto.mail, dto.phone, login]
      );
      const idUtilisateur = userRes.rows[0].id_utilisateur;

      await client.query(
        'INSERT INTO EnseignantResponsable (id_utilisateur, nom, prenom) VALUES ($1, $2, $3)',
        [idUtilisateur, dto.lastName, dto.firstName]
      );

      await client.query('COMMIT');

      try {
        await this.mailService.sendAccountCredentials(dto, password, login);
      } catch (e) {
        console.error('Erreur envoi email:', e);
      }

      return { message: 'Enseignant créé avec succès', login };
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  async createEtudiant(user: User, dto: CreateStudentDto) {
    const client = await this.db.getClientWithUserId(user.role, user.id);
    try {
      await client.query('BEGIN');

      const loginRes = await client.query('SELECT generate_login($1) as login', [dto.lastName]);
      const login = loginRes.rows[0].login;

      const checkMail = await client.query('SELECT 1 FROM Utilisateur WHERE mail = $1', [dto.mail]);
      if (checkMail.rows.length > 0) throw new ConflictException('Email déjà utilisé');

      const password = nanoid(12);
      const hashedPassword = await bcrypt.hash(password, 10);

      await client.query('INSERT INTO Compte (login, mot_de_passe) VALUES ($1, $2)', [login, hashedPassword]);

      const userRes = await client.query(
        'INSERT INTO Utilisateur (mail, num_tel, login) VALUES ($1, $2, $3) RETURNING id_utilisateur',
        [dto.mail, dto.phone, login]
      );
      const idUtilisateur = userRes.rows[0].id_utilisateur;

      await client.query(
        'INSERT INTO Etudiant (id_utilisateur, nom, prenom, date_naissance_etu, niveau_etu, statut_etu, visibilite_infos) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [idUtilisateur, dto.lastName, dto.firstName, dto.birthDate, dto.level, 'non_en_recherche', true]
      );

      await client.query('COMMIT');

      try {
        await this.mailService.sendAccountCredentials(dto, password, login);
      } catch (e) {
        console.error('Erreur envoi email:', e);
      }

      return { message: 'Étudiant créé avec succès', login };
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }
}
