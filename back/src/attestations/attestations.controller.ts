import { Controller, Post, UploadedFile, UseGuards, UseInterceptors, Req, Get, Put, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { AttestationsService } from './attestations.service';

@Controller('attestations')
@UseGuards(JwtAuthGuard)
export class AttestationsController {
    constructor(private readonly service: AttestationsService) { }

    @Get("/available")
    async getAvailableAttestations(@Req() req) {
        return await this.service.getAvailableAttestations(req.user);
    }

    @Get("/me")
    async getMyAttestation(@Req() req) {
        return await this.service.getMyAttestation(req.user);
    }

    @Put("/validate")
    async validateAttestation(@Req() req, @Body() body) {
        return await this.service.validateAttestation(req.user, body.etudiantId);
    }

    @Post()
    @UseInterceptors(
        FileInterceptor('file', {
            limits: { fileSize: 5 * 1024 * 1024 }, // 5 Mo max
        }),
    )
    async createAttestation(@UploadedFile() file: Express.Multer.File, @Req() req) {
        // Affiche le fichier côté back pour debug
        console.log('Fichier reçu:', file.originalname, 'taille:', file.size);

        // Appelle le service avec le buffer et le nom d’origine
        return this.service.createAttestation(req.user, file.buffer, file.originalname);
    }
}
