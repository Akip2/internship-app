import { Controller, Post, Get, Delete, Request, UseGuards, Param, Body } from '@nestjs/common';
import { RemplacementService } from './remplacement.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('remplacements')
@UseGuards(JwtAuthGuard)
export class RemplacementController {
  constructor(private readonly remplacementService: RemplacementService) {}

  @Post()
  async createRemplacement(
    @Request() req,
    @Body() body: { id_enseignant: number; date_debut: string; date_fin: string }
  ) {
    return await this.remplacementService.createRemplacement(
      req.user,
      body.id_enseignant,
      body.date_debut,
      body.date_fin
    );
  }

  @Get()
  async getRemplacementsForSecretary(@Request() req) {
    return await this.remplacementService.getMyCurrentReplacements(req.user);
  }

  @Get('enseignants')
  async getAllEnseignants(@Request() req) {
    return await this.remplacementService.getAllEnseignants(req.user);
  }

  @Delete(':id')
  async deleteRemplacement(@Request() req, @Param('id') id: string) {
    return await this.remplacementService.deleteRemplacement(req.user, parseInt(id));
  }
}
