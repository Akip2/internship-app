import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller("accounts")
@UseGuards(JwtAuthGuard)
export class AccountsController {
    constructor(
        private readonly accountsService: AccountsService,
    ) {}

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