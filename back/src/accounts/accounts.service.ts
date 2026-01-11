import { Injectable, ConflictException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { MailService } from '../mail/mail.service';
import { CreateAccountDto } from './dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AccountsService {
  constructor(
    private db: DatabaseService,
    private mailService: MailService,
  ) {}

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

      const hashedPassword = await bcrypt.hash(dto.password, 10);

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

      return { login, idUtilisateur };
    }).then(async (result) => {
      try {
        await this.mailService.sendAccountCredentials(dto, result.lo
        );
      } catch (error) {
        console.error('Erreur envoi email:', error);
      }

      return {
        message: 'Secrétaire créé avec succès',
        login: result.login,
      };
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

      const hashedPassword = await bcrypt.hash(dto.password, 10);

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

      return { login, idUtilisateur };
    }).then(async (result) => {
      try {
        await this.mailService.sendAccountCredentials(
          dto, result.login
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
}