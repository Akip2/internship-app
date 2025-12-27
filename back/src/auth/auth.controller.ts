import { Body, Controller, Get, Post, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CompanyRegisterDto, LoginDto } from './dto';

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post("login")
  async login(@Body() dto: LoginDto) {
    return await this.authService.login(dto);
  }

  @Post("register")
  async register(@Body() dto: CompanyRegisterDto) {
    const result = await this.authService.registerCompany(dto);

    if(!result) {
      throw new UnauthorizedException("Echec de l'inscription, login déjà existant");
    }

    return await this.authService.login(dto);
  }
}
