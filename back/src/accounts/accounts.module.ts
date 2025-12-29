import { Module } from "@nestjs/common";
import { AccountsService } from "./accounts.service";
import { AccountsController } from "./accounts.controller";
import { AuthModule } from "src/auth/auth.module";

@Module({
  imports: [AuthModule],
  controllers: [AccountsController],
  providers: [AccountsService],
})
export class AccountsModule { }