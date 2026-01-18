import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { AccountsModule } from './accounts/accounts.module';
import { MailModule } from './mail/mail.module';
import { DatabaseModule } from './database/database.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AttestationsModule } from './attestations/attestations.module';
import { OffersModule } from './offers/offers.module';
import { CandidaturesModule } from './candidatures/candidatures.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    AuthModule,
    AccountsModule,
    MailModule,
    DatabaseModule,
    NotificationsModule,
    AttestationsModule,
    OffersModule,
    CandidaturesModule
  ],
})
export class AppModule {}
