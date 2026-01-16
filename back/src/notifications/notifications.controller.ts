import { Body, Controller, Get, Post, Put, Request, UseGuards, Param } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller("notifications")
@UseGuards(JwtAuthGuard)
export class NotificationsController {
    constructor(
        private readonly service: NotificationsService,
    ) {}

    @Get("")
    async getNotifications(@Request() req) {
        return await this.service.getNotifications(req.user);
    }

    @Get("unread/count")
    async getUnreadCount(@Request() req) {
        return await this.service.getUnreadCount(req.user);
    }

    @Put(":id/read")
    async markAsRead(@Request() req, @Param('id') id: string) {
        const notification = await this.service.markAsRead(req.user, parseInt(id));
        if (!notification) {
            return { message: 'Notification non trouvée' };
        }
        return notification;
    }

    @Put("read-all")
    async markAllAsRead(@Request() req) {
        return await this.service.markAllAsRead(req.user);
    }
}