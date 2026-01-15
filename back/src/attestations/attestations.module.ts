import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AttestationsController } from './attestations.controller';
import { MailModule } from '../mail/mail.module';
import { AttestationsService } from './attestations.service';

@Module({
  imports: [
    // Importe JwtModule pour que JwtAuthGuard fonctionne
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  controllers: [AttestationsController],
  providers: [AttestationsService],
})
export class AttestationsModule {}