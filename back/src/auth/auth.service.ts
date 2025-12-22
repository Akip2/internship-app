import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto, UserDataDto, UserFoundDto } from './dto';
import { PrismaService } from 'prisma/prisma.service';
import  * as bcrypt from "bcrypt";

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService
  ) {}

  async login(body: LoginDto): Promise<UserDataDto> {
    const internauteClient = await this.prismaService.getInternauteClient();

    const user = (await internauteClient.$queryRaw<UserFoundDto[]>`
      SELECT * FROM get_user(${body.login})
    `)[0];

    if(!user.user_id) {
      throw new UnauthorizedException('Login ou mot de passe incorrects');
    }

    const correct = await bcrypt.compare(body.password, user.password_hash);

    if(!correct) {
      throw new UnauthorizedException('Login ou mot de passe incorrects');
    }

    return {
      user_id: user.user_id,
      user_role: user.user_role
    };
  }
}
