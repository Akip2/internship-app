import { Module } from '@nestjs/common';
import { RemplacementService } from './remplacement.service';
import { RemplacementController } from './remplacement.controller';
import { DatabaseModule } from '../database/database.module';
import { ConfigService } from '@nestjs/config/dist/config.service';
import { ConfigModule } from '@nestjs/config/dist/config.module';
import { JwtModule } from '@nestjs/jwt/dist/jwt.module';

@Module({
  imports: [DatabaseModule,         JwtModule.registerAsync({
              imports: [ConfigModule],
              inject: [ConfigService],
              useFactory: (configService: ConfigService) => ({
                  secret: configService.get('JWT_SECRET'),
                  signOptions: { expiresIn: '7d' },
              }),
          })],
  providers: [RemplacementService],
  controllers: [RemplacementController],
})
export class RemplacementModule {}
