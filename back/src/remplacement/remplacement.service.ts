import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

export type User = { role: string; id: number };

@Injectable()
export class RemplacementService {
    constructor(private readonly db: DatabaseService) { }

    async createRemplacement(
        user: User,
        idEnseignant: number,
        dateDebut: string,
        dateFin: string
    ) {
        if (user.role !== 'secretaire') {
            throw new BadRequestException('Seule une secrétaire peut déclarer une absence');
        }

        const client = await this.db.getClientWithUserId(user.role, user.id);

        try {
            // Vérifier que la date de fin est après la date de début
            const debut = new Date(dateDebut);
            const fin = new Date(dateFin);

            if (fin <= debut) {
                throw new BadRequestException('La date de fin doit être après la date de début');
            }

            const enseignantCheck = await client.query(
                `SELECT id_utilisateur FROM EnseignantResponsable WHERE id_utilisateur = $1`,
                [idEnseignant]
            );

            if (enseignantCheck.rows.length === 0) {
                throw new NotFoundException('Enseignant non trouvé');
            }

            const result = await client.query(
                `INSERT INTO Remplacement (id_secretaire, id_enseignant, date_debut, date_fin)
                 VALUES ($1, $2, $3, $4)`,
                [user.id, idEnseignant, dateDebut, dateFin]
            );

            return result.rows[0];
        } finally {
            client.release();
        }
    }

    async getMyCurrentReplacements(user: User) {
        const client = await this.db.getClientWithUserId(user.role, user.id);

        try {
            const result = await client.query(
                `SELECT 
                    id_remplacement,
                    id_secretaire,
                    id_enseignant,
                    date_debut,
                    date_fin
                 FROM vue_remplacements_en_cours
                 WHERE id_secretaire = $1 or id_enseignant = $1`,
                [user.id]
            );

            return result.rows;
        } finally {
            client.release();
        }
    }

    async getAllEnseignants(user: User) {
        const client = await this.db.getClientWithUserId(user.role, user.id);

        try {
            const result = await client.query(
                `SELECT 
                    er.id_utilisateur,
                    u.nom,
                    u.prenom,
                    u.email
                 FROM EnseignantResponsable er
                 JOIN Utilisateur u ON er.id_utilisateur = u.id_utilisateur
                 ORDER BY u.nom, u.prenom`
            );

            return result.rows;
        } finally {
            client.release();
        }
    }

    async deleteRemplacement(user: User, idRemplacement: number) {
        if (user.role !== 'secretaire') {
            throw new BadRequestException('Seule une secrétaire peut supprimer un remplacement');
        }

        const client = await this.db.getClientWithUserId(user.role, user.id);

        try {
            // Vérifier que le remplacement appartient à la secrétaire
            const remplacementCheck = await client.query(
                `SELECT id_remplacement FROM Remplacement WHERE id_remplacement = $1 AND id_secretaire = $2`,
                [idRemplacement, user.id]
            );

            if (remplacementCheck.rows.length === 0) {
                throw new NotFoundException('Remplacement non trouvé');
            }

            // Supprimer le remplacement
            const result = await client.query(
                `DELETE FROM Remplacement WHERE id_remplacement = $1 RETURNING *`,
                [idRemplacement]
            );

            return result.rows[0];
        } finally {
            client.release();
        }
    }
}
