import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import * as fs from 'fs';
import * as path from 'path';

export type User = { role: string; id: number };

@Injectable()
export class CandidaturesService {
    constructor(private readonly db: DatabaseService) { }

    async createCandidature(
        user: User,
        offerId: number,
        cvFile?: Express.Multer.File,
        letterFile?: Express.Multer.File
    ) {
        const client = await this.db.getClientWithUserId(user.role, user.id);

        try {
            // Vérifier que l'offre existe et est validée
            const offerCheck = await client.query(
                `SELECT id_offre, etat_offre FROM vue_offres_disponibles WHERE id_offre = $1`,
                [offerId]
            );

            if (offerCheck.rows.length === 0) {
                throw new BadRequestException('Offre non trouvée');
            }

            if (offerCheck.rows[0].etat_offre !== 'validee') {
                throw new BadRequestException('Cette offre n\'est pas disponible');
            }

            // Vérifier que l'étudiant n\'a pas déjà postulé à cette offre
            const duplicateCheck = await client.query(
                `SELECT id_candidature FROM Candidature 
         WHERE id_offre = $1 AND id_utilisateur = $2`,
                [offerId, user.id]
            );

            if (duplicateCheck.rows.length > 0) {
                throw new ConflictException('Vous avez déjà postulé à cette offre');
            }

            // Créer les chemins des fichiers
            const uploadDir = path.join(process.cwd(), 'uploads', 'candidatures');
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            let cvChemin: string | null = null;
            let lettreChemin: string | null = null;

            // Sauvegarder le CV
            if (cvFile) {
                const cvFileName = `cv_${user.id}_${offerId}_${Date.now()}.${cvFile.originalname.split('.').pop()}`;
                const cvPath = path.join(uploadDir, cvFileName);
                fs.writeFileSync(cvPath, cvFile.buffer);
                cvChemin = `uploads/candidatures/${cvFileName}`;
            }

            // Sauvegarder la lettre de motivation
            if (letterFile) {
                const letterFileName = `letter_${user.id}_${offerId}_${Date.now()}.${letterFile.originalname.split('.').pop()}`;
                const letterPath = path.join(uploadDir, letterFileName);
                fs.writeFileSync(letterPath, letterFile.buffer);
                lettreChemin = `uploads/candidatures/${letterFileName}`;
            }

            // Créer la candidature
            const result = await client.query(
                `INSERT INTO Candidature (
          etat_candidature,
          lettre_motivation_chemin,
          date_candidature,
          cv_chemin,
          id_offre,
          id_utilisateur
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *`,
                [
                    'en_attente',
                    lettreChemin,
                    new Date().toISOString().split('T')[0],
                    cvChemin,
                    offerId,
                    user.id
                ]
            );

            return result.rows[0];
        } finally {
            client.release();
        }
    }

    async getStudentCandidatures(user: User) {
        const client = await this.db.getClientWithUserId(user.role, user.id);

        try {
            const result = await client.query(
                `SELECT id_candidature,
    date_candidature,
    etat_candidature,
    intitule_offre,
    type_contrat,
    raison_sociale,
    adresse_offre,
    cv_chemin,
    lettre_motivation_chemin,
    pays
    FROM vue_candidatures_etudiant;`,
                []
            );

            return result.rows;
        } finally {
            client.release();
        }
    }

    async getOfferCandidatures(user: User, offerId: number) {
        const client = await this.db.getClientWithUserId(user.role, user.id);

        try {
            // Vérifier que l'offre appartient à l'utilisateur (pour les entreprises)
            if (user.role === 'entreprise') {
                const offerCheck = await client.query(
                    `SELECT id_offre FROM Offre WHERE id_offre = $1 AND id_utilisateur = $2`,
                    [offerId, user.id]
                );

                if (offerCheck.rows.length === 0) {
                    throw new BadRequestException('Cette offre ne vous appartient pas');
                }
            }

            const result = await client.query(
                `SELECT 
          id_candidature,
          etat_candidature,
          lettre_motivation_chemin,
          date_candidature,
          cv_chemin,
          nom,
          prenom,
          niveau_etu
        FROM vue_candidatures_entreprise`,
                []
            );

            return result.rows;
        } finally {
            client.release();
        }
    }

    async acceptCandidature(user: User, candidatureId: number) {
        const client = await this.db.getClientWithUserId(user.role, user.id);

        try {
            const result = await client.query(
                `UPDATE Candidature
                 SET etat_candidature = 'acceptee_par_entreprise'
                 WHERE id_candidature = $1
                 RETURNING *`,
                [candidatureId]
            );

            if (result.rows.length === 0) {
                throw new BadRequestException('Candidature non trouvée');
            }

            return result.rows[0];
        } finally {
            client.release();
        }
    }

    async rejectCandidature(user: User, candidatureId: number) {
        const client = await this.db.getClientWithUserId(user.role, user.id);

        try {
            const result = await client.query(
                `UPDATE Candidature
                 SET etat_candidature = 'refusee'
                 WHERE id_candidature = $1
                 RETURNING *`,
                [candidatureId]
            );

            if (result.rows.length === 0) {
                throw new BadRequestException('Candidature non trouvée');
            }

            return result.rows[0];
        } finally {
            client.release();
        }
    }

    async getPendingAffectations(user: User) {
        const client = await this.db.getClientWithUserId(user.role, user.id);

        try {
            const result = await client.query(
                `SELECT 
                    c.id_candidature,
                    e.nom as nom_etudiant,
                    e.prenom as prenom_etudiant,
                    o.intitule_offre,
                    o.type_contrat,
                    o.adresse_offre,
                    o.remuneration_offre,
                    o.date_debut_contrat,
                    o.date_fin_contrat,
                    c.etat_candidature,
                    c.date_candidature,
                    e.niveau_etu
                 FROM Candidature c
                 JOIN Etudiant e ON c.id_utilisateur = e.id_utilisateur
                 JOIN Offre o ON c.id_offre = o.id_offre
                 ORDER BY c.date_candidature DESC`,
                []
            );

            return result.rows;
        } finally {
            client.release();
        }
    }

    async validateAffectationByTeacher(user: User, candidatureId: number) {
        const client = await this.db.getClientWithUserId(user.role, user.id);

        try {
            const result = await client.query(
                `UPDATE Candidature
                 SET etat_candidature = 'validee_par_enseignant'
                 WHERE id_candidature = $1
                 RETURNING *`,
                [candidatureId]
            );

            if (result.rows.length === 0) {
                throw new BadRequestException('Candidature non trouvée');
            }

            return result.rows[0];
        } finally {
            client.release();
        }
    }

    async rejectAffectationByTeacher(user: User, candidatureId: number, justification: string) {
        const client = await this.db.getClientWithUserId(user.role, user.id);

        try {
            const result = await client.query(
                `UPDATE Candidature
                 SET etat_candidature = 'refusee'
                 WHERE id_candidature = $1`,
                [candidatureId]
            );
            return result.rows[0];
        } finally {
            client.release();
        }
    }
}
