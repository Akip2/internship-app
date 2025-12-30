import { Module } from "@nestjs/common";
import { AccountsService } from "./accounts.service";
import { AccountsController } from "./accounts.controller";
import { AuthModule } from "src/auth/auth.module";
import { MailModule } from "src/mail/mail.module";

@Module({
  imports: [AuthModule, MailModule],
  controllers: [AccountsController],
  providers: [AccountsService],
})
export class AccountsModule { }