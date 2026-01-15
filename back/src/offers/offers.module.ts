import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OffersController } from './offers.controller';
import { OffersService } from './offers.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [
    DatabaseModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  controllers: [OffersController],
  providers: [OffersService],
  exports: [OffersService],
})
export class OffersModule {}
