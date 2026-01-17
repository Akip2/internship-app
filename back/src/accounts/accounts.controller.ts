import { Body, Controller, Get, Post, Put, Request, UseGuards } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { CreateAccountDto, CreateStudentDto, PasswordChangeDto } from './dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('accounts')
@UseGuards(JwtAuthGuard)
export class AccountsController {
    constructor(private readonly accountsService: AccountsService) { }

    @Put('etudiant')
    async updateEtudiant(@Request() req, @Body() body: any) {
        console.log(body);
        console.log(req.user);
        return await this.accountsService.updateStudentBySecretaire(req.user, body);
    }

    @Get('me')
    async getMyProfile(@Request() req) {
        return this.accountsService.getMyProfile(req.user); // req.user = User
    }

    @Put('me')
    async updateMyProfile(@Request() req, @Body() body) {
        return this.accountsService.updateMyProfile(req.user, body);
    }

    @Put('change-password')
    async changePassword(@Request() req, @Body() body: PasswordChangeDto) {
        return this.accountsService.changePassword(req.user, body.newPassword);
    }

    @Get('secretaire')
    async getSecretaires(@Request() req) {
        return this.accountsService.getSecretaires(req.user);
    }

    @Get('enseignant')
    async getEnseignants(@Request() req) {
        return this.accountsService.getEnseignants(req.user);
    }

    @Post('secretaire')
    async createSecretaire(@Request() req, @Body() dto: CreateAccountDto) {
        return this.accountsService.createSecretaire(req.user, dto);
    }

    @Post('enseignant')
    async createEnseignant(@Request() req, @Body() dto: CreateAccountDto) {
        return this.accountsService.createEnseignant(req.user, dto);
    }

    @Get('etudiant')
    async getEtudiants(@Request() req) {
        return this.accountsService.getEtudiants(req.user);
    }

    @Post('etudiant')
    async createEtudiant(@Request() req, @Body() dto: CreateStudentDto) {
        return this.accountsService.createEtudiant(req.user, dto);
    }

    @Get('etudiant/public')
    async getPublicStudentProfiles(@Request() req) {
        return this.accountsService.getPublicStudentProfiles(req.user);
    }
}
