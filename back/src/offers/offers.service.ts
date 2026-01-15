import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

export type User = { role: string; id: number };

@Injectable()
export class OffersService {
  constructor(private readonly db: DatabaseService) {}

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

  // Créer une nouvelle offre
  async createOffer(user: User, data: any) {
    const pool = this.db.getPool(user.role);
    const client = await pool.connect();

    try {
      // Validation et valeurs par défaut
      let duree_validite = data.duree_validite ? parseInt(data.duree_validite) : 12;
      
      // Validation: duree_validite entre 1 et 12
      if (duree_validite < 1 || duree_validite > 12) {
        throw new Error('La durée de validité doit être entre 1 et 12 mois');
      }

      // Calculer duree_contrat à partir des dates
      let duree_contrat = 0;
      if (data.date_debut_contrat && data.date_fin_contrat) {
        const dateDebut = new Date(data.date_debut_contrat);
        const dateFin = new Date(data.date_fin_contrat);
        const diffTime = Math.abs(dateFin.getTime() - dateDebut.getTime());
        duree_contrat = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }

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
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
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
          'deposee', // État initial
          user.id,
        ]
      );

      return result.rows[0];
    } finally {
      client.release();
    }
  }

  // Mettre à jour une offre
  async updateOffer(user: User, offerId: number, data: any) {
    const pool = this.db.getPool(user.role);
    const client = await pool.connect();

    try {
      // Vérifier que l'offre appartient à l'utilisateur
      const check = await client.query(
        `SELECT id_offre FROM offre WHERE id_offre = $1 AND id_utilisateur = $2`,
        [offerId, user.id]
      );

      if (check.rows.length === 0) {
        return null;
      }

      // Validation et valeurs par défaut pour duree_validite
      let duree_validite = data.duree_validite !== undefined ? parseInt(data.duree_validite) : null;
      
      if (duree_validite !== null && (duree_validite < 1 || duree_validite > 12)) {
        throw new Error('La durée de validité doit être entre 1 et 12 mois');
      }

      // Calculer duree_contrat à partir des dates si elles sont fournies
      let duree_contrat = 0;
      if (data.date_debut_contrat && data.date_fin_contrat) {
        const dateDebut = new Date(data.date_debut_contrat);
        const dateFin = new Date(data.date_fin_contrat);
        const diffTime = Math.abs(dateFin.getTime() - dateDebut.getTime());
        duree_contrat = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }

      const result = await client.query(
        `UPDATE offre SET
          intitule_offre = COALESCE($1, intitule_offre),
          duree_validite = COALESCE($2, duree_validite),
          type_contrat = COALESCE($3, type_contrat),
          duree_contrat = COALESCE($4, duree_contrat),
          date_debut_contrat = COALESCE($5, date_debut_contrat),
          date_fin_contrat = COALESCE($6, date_fin_contrat),
          adresse_offre = COALESCE($7, adresse_offre),
          remuneration_offre = COALESCE($8, remuneration_offre),
          pays = COALESCE($9, pays),
          etat_offre = COALESCE($10, etat_offre)
        WHERE id_offre = $11 AND id_utilisateur = $12
        RETURNING *`,
        [
          data.intitule_offre || null,
          duree_validite,
          data.type_contrat || null,
          duree_contrat,
          data.date_debut_contrat || null,
          data.date_fin_contrat || null,
          data.adresse_offre || null,
          data.remuneration_offre || null,
          data.pays || null,
          data.etat_offre || null,
          offerId,
          user.id,
        ]
      );

      return result.rows[0];
    } finally {
      client.release();
    }
  }

  // Supprimer une offre
  async deleteOffer(user: User, offerId: number) {
    const pool = this.db.getPool(user.role);
    const client = await pool.connect();

    try {
      const result = await client.query(
        `DELETE FROM offre WHERE id_offre = $1 AND id_utilisateur = $2
        RETURNING id_offre`,
        [offerId, user.id]
      );

      return result.rowCount! > 0 ? { message: 'Offre supprimée avec succès' } : null;
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
}
