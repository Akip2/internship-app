import { Module } from '@nestjs/common';
import { CandidaturesService } from './candidatures.service';
import { DatabaseModule } from '../database/database.module';
import { MulterModule } from '@nestjs/platform-express';
import { CandidaturesController } from './candidatures.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config/dist/config.service';
import { ConfigModule } from '@nestjs/config/dist/config.module';

@Module({
    imports: [
        DatabaseModule,
        MulterModule.register({
            storage: require('multer').memoryStorage(),
            limits: { fileSize: 10 * 1024 * 1024 },
        }),

        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get('JWT_SECRET'),
                signOptions: { expiresIn: '7d' },
            }),
        })
    ],
    providers: [CandidaturesService],
    controllers: [CandidaturesController],
})
export class CandidaturesModule { }
