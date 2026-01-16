import { Controller, Get, Post, Put, Delete, Request, UseGuards, Param, Body } from '@nestjs/common';
import { OffersService } from './offers.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('offers')
@UseGuards(JwtAuthGuard)
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  // Récupérer toutes les offres de l'utilisateur
  @Get()
  async getMyOffers(@Request() req) {
    return await this.offersService.getMyOffers(req.user);
  }

  // Récupérer une offre par ID
  @Get(':id')
  async getOfferById(@Request() req, @Param('id') id: string) {
    const offer = await this.offersService.getOfferById(req.user, parseInt(id));
    if (!offer) {
      return { message: 'Offre non trouvée' };
    }
    return offer;
  }

  // Créer une nouvelle offre
  @Post()
  async createOffer(@Request() req, @Body() body: any) {
    return await this.offersService.createOffer(req.user, body);
  }

  // Mettre à jour une offre
  @Put(':id')
  async updateOffer(@Request() req, @Param('id') id: string, @Body() body: any) {
    const offer = await this.offersService.updateOffer(req.user, parseInt(id), body);
    if (!offer) {
      return { message: 'Offre non trouvée' };
    }
    return offer;
  }

  // Supprimer une offre
  @Delete(':id')
  async deleteOffer(@Request() req, @Param('id') id: string) {
    const result = await this.offersService.deleteOffer(req.user, parseInt(id));
    if (!result) {
      return { message: 'Offre non trouvée' };
    }
    return result;
  }

  // Désactiver une offre
  @Put(':id/disable')
  async disableOffer(@Request() req, @Param('id') id: string) {
    const offer = await this.offersService.disableOffer(req.user, parseInt(id));
    if (!offer) {
      return { message: 'Offre non trouvée' };
    }
    return offer;
  }

  // Récupérer les candidatures pour une offre
  @Get(':id/candidatures')
  async getOfferCandidatures(@Request() req, @Param('id') id: string) {
    return await this.offersService.getOfferCandidatures(req.user, parseInt(id));
  }

  // Récupérer les offres à valider (pour enseignants)
  @Get('validation/pending')
  async getOffersToValidate(@Request() req) {
    return await this.offersService.getOffersToValidate(req.user);
  }

  // Valider une offre (pour enseignants)
  @Put(':id/validate')
  async validateOffer(@Request() req, @Param('id') id: string) {
    const offer = await this.offersService.validateOffer(req.user, parseInt(id));
    if (!offer) {
      return { message: 'Offre non trouvée' };
    }
    return offer;
  }

  // Refuser une offre (pour enseignants)
  @Put(':id/reject')
  async rejectOffer(@Request() req, @Param('id') id: string) {
    const offer = await this.offersService.rejectOffer(req.user, parseInt(id));
    if (!offer) {
      return { message: 'Offre non trouvée' };
    }
    return offer;
  }
}
