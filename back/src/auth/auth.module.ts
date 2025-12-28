import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtAuthGuard } from "./jwt-auth.guard";

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configSercice: ConfigService) => ({
        secret: configSercice.get("JWT_SECRET"),
        signOptions: { expiresIn: '24h' },
      }),
      inject: [ConfigService]
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard],
  exports: [JwtAuthGuard]
})
export class AuthModule { }