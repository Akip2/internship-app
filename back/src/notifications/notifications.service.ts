import { Injectable, ConflictException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

export type User = { role: string; id: number };

@Injectable()
export class NotificationsService {
  constructor(
    private db: DatabaseService,
  ) {}

  async getNotifications(user: User) {
    const pool = this.db.getPool(user.role);
    const client = await pool.connect();

    try {
      const result = await client.query(
        `SELECT id_notification, texte, lue 
         FROM notification 
         WHERE id_utilisateur = $1 
         ORDER BY id_notification DESC`,
        [user.id]
      );
      return result.rows;
    } finally {
      client.release();
    }
  }

  async getUnreadCount(user: User) {
    const pool = this.db.getPool(user.role);
    const client = await pool.connect();

    try {
      const result = await client.query(
        `SELECT COUNT(*) as count 
         FROM notification 
         WHERE id_utilisateur = $1 AND lue = false`,
        [user.id]
      );
      return { count: parseInt(result.rows[0].count) };
    } finally {
      client.release();
    }
  }

  async markAsRead(user: User, notificationId: number) {
    const pool = this.db.getPool(user.role);
    const client = await pool.connect();

    try {
      const result = await client.query(
        `UPDATE notification 
         SET lue = true 
         WHERE id_notification = $1 AND id_utilisateur = $2
         RETURNING *`,
        [notificationId, user.id]
      );
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  async markAllAsRead(user: User) {
    const pool = this.db.getPool(user.role);
    const client = await pool.connect();

    try {
      const result = await client.query(
        `UPDATE notification 
         SET lue = true 
         WHERE id_utilisateur = $1 AND lue = false
         RETURNING *`,
        [user.id]
      );
      return { count: result.rowCount };
    } finally {
      client.release();
    }
  }
}