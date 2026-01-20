import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from '../database/database.service';
import * as bcrypt from 'bcrypt';
import { CompanyRegisterDto, LoginDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private db: DatabaseService,
    private jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    // Utilise la fonction PostgreSQL get_user avec le rôle internaute
    const result = await this.db.query(
      'internaute',
      'SELECT * FROM get_user($1)',
      [dto.login]
    );

    if (result.rows.length === 0 || !result.rows[0].user_id) {
      throw new UnauthorizedException('Login ou mot de passe incorrect');
    }

    const user = result.rows[0];

    // Vérifie le mot de passe
    const isPasswordValid = await bcrypt.compare(dto.password, user.password_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Login ou mot de passe incorrect');
    }

    // Génère le JWT avec les mêmes noms que dans ton Guard
    const payload = {
      userId: user.user_id,
      userRole: user.user_role,
      login: dto.login,
    };

    return {
      token: this.jwtService.sign(payload),
      user: {
        id: user.user_id,
        role: user.user_role,
        login: dto.login,
      },
    };
  }

  async registerEntreprise(dto: CompanyRegisterDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const result = await this.db.query(
      'internaute',
      'SELECT add_entreprise($1, $2, $3, $4, $5, $6, $7, $8) as success',
      [
        dto.login,
        hashedPassword,
        dto.siret,
        dto.mail,
        dto.phone,
        dto.name,
        dto.sector,
        dto.address,
      ]
    );

    if (!result.rows[0].success) {
      throw new ConflictException('Login, SIRET ou raison sociale déjà utilisé');
    }

    return { message: 'Entreprise créée avec succès' };
  }
}
