import { Injectable, ConflictException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class NotificationsService {
  constructor(
    private db: DatabaseService,
  ) {}

  async getNotifications(userRole: string, userId: number) {
    const client = await this.db.getClientWithUserId(userRole, userId);
    const result = await client.query(
      `SELECT id_notification, texte, lue FROM Notification WHERE id_utilisateur=$1 ORDER BY id_notification`,
      [userId]
    );
  
    return result.rows;
  }
}