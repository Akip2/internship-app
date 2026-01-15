import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import * as fs from 'fs/promises';
import * as path from 'path';
import { nanoid } from 'nanoid';

export interface User {
  id: number;
  role: string;
}

// Constante globale pour le dossier uploads
export const UPLOADS_DIR = path.join(process.cwd(), 'uploads', 'attestations');

@Injectable()
export class AttestationsService {
  constructor(private db: DatabaseService) {}

  async getAvailableAttestations(user: User) {
    const client = await this.db.getClientWithUserId(user.role, user.id);
    try {
      const res = await client.query(
        `SELECT nom, prenom, attestation_chemin
         FROM Etudiant
         WHERE attestation_rc = 'disponible'`
      );

      return res.rows;
    } catch (e) {
      throw e;
    }
  }

  async validateAttestation(user: User, etudiantId: number) {
    const client = await this.db.getClientWithUserId(user.role, user.id);
    try {
      await client.query('BEGIN');

      await client.query(
        `UPDATE Etudiant
         SET attestation_rc = 'validee'
         WHERE id = $1`,
        [etudiantId]
      );

      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  async getMyAttestation(user: User) {
    const client = await this.db.getClientWithUserId(user.role, user.id);
    try {
      const res = await client.query(
        `SELECT attestation_chemin, attestation_rc
         FROM Etudiant
         WHERE id_utilisateur = $1`,
        [user.id]
      );
      return res.rows[0];
    } catch (e) {
      throw e;
    }
  }

  /**
   * Sauvegarde une attestation pour un utilisateur
   * @param user L'utilisateur connecté
   * @param file Buffer du fichier envoyé
   * @param originalName Nom original côté client
   */
  async createAttestation(user: User, file: Buffer, originalName: string) {
    const client = await this.db.getClientWithUserId(user.role, user.id);

    try {
      await client.query('BEGIN');

      // Générer un nom unique
      const ext = path.extname(originalName);
      const fileName = `${nanoid(12)}${ext}`;

      // Crée le dossier s'il n'existe pas
      await fs.mkdir(UPLOADS_DIR, { recursive: true });

      // Sauvegarde du fichier sur disque
      const filePath = path.join(UPLOADS_DIR, fileName);
      await fs.writeFile(filePath, file);

      // Update DB : on stocke uniquement le nom du fichier
      await client.query(
        `UPDATE Etudiant
         SET attestation_chemin = $1, attestation_rc = 'disponible'
         WHERE id_utilisateur = $2`,
        [fileName, user.id],
      );

      await client.query('COMMIT');

      return { message: 'Attestation déposée avec succès', fileName };
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }
}
