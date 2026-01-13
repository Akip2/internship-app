import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
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
        return await this.service.getNotifications(req.user.role, req.user.id);
    }
}