import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    
    const authHeader = request.headers.authorization;
    
    if (!authHeader) {
      throw new UnauthorizedException('Token manquant');
    }
    
    const token = authHeader.replace('Bearer ', '');
    
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_SECRET'),
      });
      
      // Vérifier si l'enseignant est en mode secrétaire temporaire
      const tempSecretaireMode = request.headers['x-temp-secretaire-mode'] === 'true';
      
      request.user = {
        id: payload.userId,
        role: payload.userRole,
        tempSecretaireMode: tempSecretaireMode && payload.userRole === 'enseignant',
      };
      
      return true;
      
    } catch (error) {
      throw new UnauthorizedException('Token invalide ou expiré');
    }
  }
}