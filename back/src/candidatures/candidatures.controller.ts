import { Controller, Post, Get, Request, UseGuards, Param, Body, UseInterceptors, UploadedFiles, Put } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { CandidaturesService } from './candidatures.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('candidatures')
@UseGuards(JwtAuthGuard)
export class CandidaturesController {
  constructor(private readonly candidaturesService: CandidaturesService) {}

  @Post(':offerId')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'cv', maxCount: 1 },
      { name: 'lettre_motivation', maxCount: 1 },
    ])
  )
  async createCandidature(
    @Request() req,
    @Param('offerId') offerId: string,
    @UploadedFiles() files: { cv?: Express.Multer.File[]; lettre_motivation?: Express.Multer.File[] }
  ) {
    return await this.candidaturesService.createCandidature(
      req.user,
      parseInt(offerId),
      files?.cv?.[0],
      files?.lettre_motivation?.[0]
    );
  }

  @Get('my')
  async getStudentCandidatures(@Request() req) {
    return await this.candidaturesService.getStudentCandidatures(req.user);
  }

  @Get('offer/:offerId')
  async getOfferCandidatures(@Request() req, @Param('offerId') offerId: string) {
    return await this.candidaturesService.getOfferCandidatures(
      req.user,
      parseInt(offerId)
    );
  }

  @Put(':candidatureId/accept')
  async acceptCandidature(@Request() req, @Param('candidatureId') candidatureId: string) {
    return await this.candidaturesService.acceptCandidature(
      req.user,
      parseInt(candidatureId)
    );
  }

  @Put(':candidatureId/reject')
  async rejectCandidature(@Request() req, @Param('candidatureId') candidatureId: string) {
    return await this.candidaturesService.rejectCandidature(
      req.user,
      parseInt(candidatureId)
    );
  }

  @Get('validation/pending')
  async getPendingAffectations(@Request() req) {
    return await this.candidaturesService.getPendingAffectations(req.user);
  }

  @Put(':candidatureId/validate-teacher')
  async validateAffectationByTeacher(@Request() req, @Param('candidatureId') candidatureId: string) {
    return await this.candidaturesService.validateAffectationByTeacher(
      req.user,
      parseInt(candidatureId)
    );
  }

  @Put(':candidatureId/reject-teacher')
  async rejectAffectationByTeacher(@Request() req, @Param('candidatureId') candidatureId: string, @Body() body: { justification: string }) {
    return await this.candidaturesService.rejectAffectationByTeacher(
      req.user,
      parseInt(candidatureId),
      body.justification
    );
  }
}
