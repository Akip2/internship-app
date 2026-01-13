import { Body, Controller, Get, Post, Put, Request, UseGuards } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { CreateAccountDto, PasswordChangeDto } from './dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller("accounts")
@UseGuards(JwtAuthGuard)
export class AccountsController {
    constructor(
        private readonly accountsService: AccountsService,
    ) { }

    @Get('me')
    async getMyProfile(@Request() req) {
        return this.accountsService.getMyProfile(
            req.user.role,
            req.user.id
        );
    }

    @Put('me')
    async updateMyProfile(@Request() req, @Body() body) {
        return this.accountsService.updateMyProfile(
            req.user.role,
            req.user.id,
            body,
        );
    }

    @Put("change-password")
    async changePassword(@Request() req, @Body() body: PasswordChangeDto) {
        return await this.accountsService.changePassword(req.user.role, req.user.id, body.newPassword);
    }

    @Get("secretaire")
    async getSecretaires(@Request() req) {
        // Le rôle vient du JWT décodé par le Guard
        return await this.accountsService.getSecretaires(req.user.role);
    }

    @Get("enseignant")
    async getEnseignants(@Request() req) {
        return await this.accountsService.getEnseignants(req.user.role);
    }

    @Post("secretaire")
    async createSecretaire(@Request() req, @Body() dto: CreateAccountDto) {
        return await this.accountsService.createSecretaire(req.user.role, dto);
    }

    @Post("enseignant")
    async createEnseignant(@Request() req, @Body() dto: CreateAccountDto) {
        return await this.accountsService.createEnseignant(req.user.role, dto);
    }
}