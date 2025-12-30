import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { PrismaService } from 'prisma/prisma.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateAccountDto } from './dto';

@Controller("accounts")
@UseGuards(JwtAuthGuard)
export class AccountsController {
    constructor(
        private readonly accountsService: AccountsService,
        private readonly prismaService: PrismaService
    ) { }

    @Get("secretaire")
    async getSecretaires(@Request() req) {
        const client = await this.prismaService.getClientForRole(req.user.role);
        return await this.accountsService.getSecretaires(client);
    }

    @Get("enseignant")
    async getEnseignants(@Request() req) {
        const client = await this.prismaService.getClientForRole(req.user.role);
        return await this.accountsService.getEnseignants(client);
    }

    @Post("secretaire")
    async createSecretaire(@Request() req, @Body() dto: CreateAccountDto) {
        const client = await this.prismaService.getClientForRole(req.user.role);
        return await this.accountsService.createSecretaire(client, dto);
    }

    @Post("enseignant")
    async createEnseignant(@Request() req, @Body() dto: CreateAccountDto) {
        const client = await this.prismaService.getClientForRole(req.user.role);
        return await this.accountsService.createEnseignant(client, dto);
    }
}