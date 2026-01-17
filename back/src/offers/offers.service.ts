import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

export type User = { role: string; id: number };

@Injectable()
export class OffersService {
    constructor(private readonly db: DatabaseService) { }

    // Récupérer toutes les offres de l'entreprise
    async getMyOffers(user: User) {
        const pool = this.db.getPool(user.role);
        const client = await pool.connect();

        try {
            const result = await client.query(
                `SELECT 
          o.id_offre,
          o.intitule_offre,
          o.type_contrat,
          o.etat_offre,
          o.duree_validite,
          o.duree_contrat,
          o.date_debut_contrat,
          o.date_fin_contrat,
          o.adresse_offre,
          o.remuneration_offre,
          o.pays,
          COUNT(c.id_candidature) as candidatures_count
        FROM offre o
        LEFT JOIN candidature c ON o.id_offre = c.id_offre
        WHERE o.id_utilisateur = $1
        GROUP BY o.id_offre
        ORDER BY o.id_offre DESC`,
                [user.id]
            );

            return result.rows;
        } finally {
            client.release();
        }
    }

    // Récupérer une offre par ID
    async getOfferById(user: User, offerId: number) {
        const pool = this.db.getPool(user.role);
        const client = await pool.connect();

        try {
            const result = await client.query(
                `SELECT * FROM offre WHERE id_offre = $1 AND id_utilisateur = $2`,
                [offerId, user.id]
            );

            if (result.rows.length === 0) {
                return null;
            }

            return result.rows[0];
        } finally {
            client.release();
        }
    }

    async createOffer(user: User, data: any) {
        const pool = this.db.getPool(user.role);
        const client = await pool.connect();

        try {
            const duree_validite = data.duree_validite
                ? parseInt(data.duree_validite)
                : 12;

            if (duree_validite < 1 || duree_validite > 12) {
                throw new BadRequestException(
                    'La durée de validité doit être comprise entre 1 et 12 mois'
                );
            }

            let duree_contrat = 0;

            if (data.date_debut_contrat && data.date_fin_contrat) {
                duree_contrat = this.calculateDurationInDays(
                    data.date_debut_contrat,
                    data.date_fin_contrat
                );
            }

            this.checkOfferLegality(
                {
                    type_contrat: data.type_contrat,
                    pays: data.pays,
                    remuneration_offre: data.remuneration_offre,
                },
                user,
                duree_contrat!
            );

            const result = await client.query(
                `INSERT INTO offre (
                    intitule_offre,
                    duree_validite,
                    type_contrat,
                    duree_contrat,
                    date_debut_contrat,
                    date_fin_contrat,
                    adresse_offre,
                    remuneration_offre,
                    pays,
                    etat_offre,
                    id_utilisateur
                ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
                RETURNING *`,
                [
                    data.intitule_offre,
                    duree_validite,
                    data.type_contrat,
                    duree_contrat,
                    data.date_debut_contrat || null,
                    data.date_fin_contrat || null,
                    data.adresse_offre,
                    data.remuneration_offre || null,
                    data.pays,
                    'deposee',
                    user.id,
                ]
            );

            return result.rows[0];
        } finally {
            client.release();
        }
    }

    /* ============================================================
       MISE À JOUR D’OFFRE
       ============================================================ */
    async updateOffer(user: User, offerId: number, data: any) {
        const pool = this.db.getPool(user.role);
        const client = await pool.connect();

        try {
            const check = await client.query(
                `SELECT * FROM offre WHERE id_offre = $1 AND id_utilisateur = $2`,
                [offerId, user.id]
            );

            if (check.rows.length === 0) return null;

            const existing = check.rows[0];

            if (
                existing.etat_offre === 'validee' ||
                existing.etat_offre === 'desactivee'
            ) {
                throw new BadRequestException(
                    'Une offre validée ou désactivée ne peut pas être modifiée'
                );
            }

            const merged = {
                type_contrat: data.type_contrat ?? existing.type_contrat,
                pays: data.pays ?? existing.pays,
                remuneration_offre:
                    data.remuneration_offre ?? existing.remuneration_offre,
                date_debut_contrat:
                    data.date_debut_contrat ?? existing.date_debut_contrat,
                date_fin_contrat:
                    data.date_fin_contrat ?? existing.date_fin_contrat,
            };

            const duree_validite =
                data.duree_validite !== undefined
                    ? parseInt(data.duree_validite)
                    : existing.duree_validite;

            if (duree_validite < 1 || duree_validite > 12) {
                throw new BadRequestException(
                    'La durée de validité doit être comprise entre 1 et 12 mois'
                );
            }

            let duree_contrat = existing.duree_contrat;

            if (merged.date_debut_contrat && merged.date_fin_contrat) {
                duree_contrat = this.calculateDurationInDays(
                    merged.date_debut_contrat,
                    merged.date_fin_contrat
                );
            }

            this.checkOfferLegality(
                {
                    type_contrat: merged.type_contrat,
                    pays: merged.pays,
                    remuneration_offre: merged.remuneration_offre,
                },
                user,
                duree_contrat
            );

            const result = await client.query(
                `UPDATE offre SET
                    intitule_offre = COALESCE($1, intitule_offre),
                    duree_validite = $2,
                    type_contrat = $3,
                    duree_contrat = $4,
                    date_debut_contrat = $5,
                    date_fin_contrat = $6,
                    adresse_offre = COALESCE($7, adresse_offre),
                    remuneration_offre = $8,
                    pays = $9,
                    etat_offre = 'en_modification'
                WHERE id_offre = $10 AND id_utilisateur = $11
                RETURNING *`,
                [
                    data.intitule_offre ?? null,
                    duree_validite,
                    merged.type_contrat,
                    duree_contrat,
                    merged.date_debut_contrat,
                    merged.date_fin_contrat,
                    data.adresse_offre ?? null,
                    merged.remuneration_offre,
                    merged.pays,
                    offerId,
                    user.id,
                ]
            );

            return result.rows[0];
        } finally {
            client.release();
        }
    }

    // Désactiver une offre
    async disableOffer(user: User, offerId: number) {
        const pool = this.db.getPool(user.role);
        const client = await pool.connect();

        try {
            const result = await client.query(
                `UPDATE offre SET etat_offre = 'desactivee'
        WHERE id_offre = $1 AND id_utilisateur = $2
        RETURNING *`,
                [offerId, user.id]
            );

            return result.rows[0] || null;
        } finally {
            client.release();
        }
    }

    checkOfferLegality(data: any, user: User, dureeContratJours: number) {
        const type = data.type_contrat;
        const pays = data.pays;
        const remuneration = data.remuneration_offre;

        const HEURES_MENSUELLES = 151.67;
        const SMIC_HORAIRE = 1766.92 / HEURES_MENSUELLES;
        const ALTERNANCE_MIN_HORAIRE = 477.07 / HEURES_MENSUELLES;

        if (type === 'alternance' && pays !== 'France') {
            throw new BadRequestException("Une alternance doit obligatoirement être située en France.");
        }

        if (type === 'stage') {
            if (dureeContratJours > 183) {
                throw new BadRequestException("La durée d’un stage ne peut pas dépasser 6 mois.");
            }

            if (dureeContratJours >= 60) {
                if (!remuneration || remuneration < 4.35) {
                    throw new BadRequestException(
                        "Un stage de 2 mois ou plus doit être rémunéré au minimum 4,35 € par heure."
                    );
                }
            }
        }

        if (type === 'alternance') {
            if (dureeContratJours < 183 || dureeContratJours > 1095) {
                throw new BadRequestException(
                    "La durée d’une alternance doit être comprise entre 6 mois et 3 ans."
                );
            }

            if (!remuneration || remuneration < ALTERNANCE_MIN_HORAIRE) {
                throw new BadRequestException(
                    "La rémunération horaire de l’alternance est inférieure au minimum légal."
                );
            }
        }

        if (type === 'cdd') {
            if (dureeContratJours > 548) {
                throw new BadRequestException(
                    "La durée d’un CDD ne peut pas dépasser 18 mois (hors exceptions)."
                );
            }

            if (!remuneration || remuneration < SMIC_HORAIRE) {
                throw new BadRequestException(
                    "La rémunération horaire d’un CDD ne peut pas être inférieure au SMIC."
                );
            }
        }
    }

    // Récupérer les candidatures pour une offre
    async getOfferCandidatures(user: User, offerId: number) {
        const pool = this.db.getPool(user.role);
        const client = await pool.connect();

        try {
            const result = await client.query(
                `SELECT c.*, e.nom, e.prenom 
        FROM candidature c
        JOIN offre o ON c.id_offre = o.id_offre
        JOIN etudiant e ON c.id_utilisateur = e.id_utilisateur
        WHERE o.id_offre = $1 AND o.id_utilisateur = $2
        ORDER BY c.id_candidature DESC`,
                [offerId, user.id]
            );

            return result.rows;
        } finally {
            client.release();
        }
    }

    // Récupérer les offres à valider (pour enseignants)
    async getOffersToValidate(user: User) {
        const pool = this.db.getPool(user.role);
        const client = await pool.connect();

        try {
            const result = await client.query(
                `SELECT 
          id_offre,
          intitule_offre,
          type_contrat,
          etat_offre,
          duree_validite,
          duree_contrat,
          date_debut_contrat,
          date_fin_contrat,
          adresse_offre,
          remuneration_offre,
          pays,
          entreprise_nom
        FROM vue_offres_deposees`,
                []
            );

            return result.rows;
        } finally {
            client.release();
        }
    }

    // Valider une offre (pour enseignants)
    async validateOffer(user: User, offerId: number) {
        const pool = this.db.getPool(user.role);
        const client = await pool.connect();

        try {
            const result = await client.query(
                `UPDATE offre SET etat_offre = 'validee'
        WHERE id_offre = $1
        RETURNING *`,
                [offerId]
            );

            return result.rows[0] || null;
        } finally {
            client.release();
        }
    }

    // Refuser une offre (pour enseignants)
    async rejectOffer(user: User, offerId: number) {
        const pool = this.db.getPool(user.role);
        const client = await pool.connect();

        try {
            const result = await client.query(
                `UPDATE offre SET etat_offre = 'refusee'
        WHERE id_offre = $1
        RETURNING *`,
                [offerId]
            );

            return result.rows[0] || null;
        } finally {
            client.release();
        }
    }

    // Réactiver une offre désactivée
    async reactivateOffer(user: User, offerId: number) {
        const pool = this.db.getPool(user.role);
        const client = await pool.connect();

        try {
            // Vérifier que l'offre appartient à l'utilisateur et qu'elle est désactivée
            const check = await client.query(
                `SELECT id_offre, etat_offre FROM offre WHERE id_offre = $1 AND id_utilisateur = $2`,
                [offerId, user.id]
            );

            if (check.rows.length === 0) {
                return null;
            }

            const offer = check.rows[0];
            if (offer.etat_offre !== 'desactivee') {
                throw new BadRequestException('Seules les offres désactivées peuvent être réactivées');
            }

            const result = await client.query(
                `UPDATE offre SET etat_offre = 'deposee'
        WHERE id_offre = $1 AND id_utilisateur = $2
        RETURNING *`,
                [offerId, user.id]
            );

            return result.rows[0] || null;
        } finally {
            client.release();
        }
    }

    private calculateDurationInDays(start: string, end: string): number {
        const startDate = new Date(start);
        const endDate = new Date(end);

        // Normalisation à minuit (évite les bugs timezone)
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);

        if (endDate < startDate) {
            throw new BadRequestException(
                'La date de fin doit être postérieure ou égale à la date de début'
            );
        }

        const diffMs = endDate.getTime() - startDate.getTime();
        const diffDays = diffMs / (1000 * 60 * 60 * 24);

        // +1 → durée inclusive (du 1 au 1 = 1 jour)
        return diffDays + 1;
    }

    // Récupérer les offres disponibles pour les étudiants (validées)
    async getAvailableOffers(user: User, typeContrat?: string) {
        const pool = this.db.getPool(user.role);
        const client = await pool.connect();

        try {
            // Vérifier que l'étudiant a une attestation validée
            const attestationCheck = await client.query(
                `SELECT attestation_rc FROM Etudiant WHERE id_utilisateur = $1`,
                [user.id]
            );

            if (attestationCheck.rows.length === 0 || attestationCheck.rows[0].attestation_rc !== 'validee') {
                throw new BadRequestException('Vous devez avoir une attestation validée pour accéder aux offres');
            }

            // Récupérer les offres validées
            let query = `
                SELECT 
                    id_offre,
                    intitule_offre,
                    type_contrat,
                    etat_offre,
                    duree_validite,
                    duree_contrat,
                    date_debut_contrat,
                    date_fin_contrat,
                    adresse_offre,
                    remuneration_offre,
                    pays,
                    entreprise_nom
                FROM vue_offres_disponibles
            `;

            const params: any[] = [];

            if (typeContrat) {
                query += ` AND o.type_contrat = $${params.length + 1}`;
                params.push(typeContrat);
            }

            query += ` ORDER BY o.id_offre DESC`;

            const result = await client.query(query, params);
            return result.rows;
        } finally {
            client.release();
        }
    }

}
