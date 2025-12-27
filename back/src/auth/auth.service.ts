import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CompanyRegisterDto, LoginDto, UserDataDto, UserFoundDto } from './dto';
import { PrismaService } from 'prisma/prisma.service';
import * as bcrypt from "bcrypt";
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService
  ) { }

  async login(body: LoginDto): Promise<UserDataDto> {
    const internauteClient = await this.prismaService.getInternauteClient();

    const user = (await internauteClient.$queryRaw<UserFoundDto[]>`
      SELECT * FROM get_user(${body.login})
    `)[0];

    if (!user.user_id) {
      throw new UnauthorizedException('Login ou mot de passe incorrects');
    }

    const correct = await bcrypt.compare(body.password, user.password_hash);

    if (!correct) {
      throw new UnauthorizedException('Login ou mot de passe incorrects');
    }

    const payload = {
      userId: user.user_id,
      userRole: user.user_role
    };
    const token = this.jwtService.sign(payload);

    return {
      token: token,
      userId: user.user_id,
      userRole: user.user_role
    };
  }

  async registerCompany(body: CompanyRegisterDto): Promise<boolean> {
    const internauteClient = await this.prismaService.getInternauteClient();
    const { login, password, siret, name, sector, mail, phone, address } = body;

    const hash = await bcrypt.hash(password, 10);

    const result: boolean = (await internauteClient.$queryRaw`
      SELECT add_entreprise(
        ${login},
        ${hash}, 
        ${siret},
        ${mail},
        ${phone},
        ${name},
        ${sector},
        ${address}
      )
    `);

    return result;
  }
}
