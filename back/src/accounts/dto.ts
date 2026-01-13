import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { MIN_PASSWORD_LENGTH } from 'src/auth/dto';

export class CreateAccountDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  mail: string;

  @IsString()
  @IsNotEmpty()
  phone: string;
}

export class PasswordChangeDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(MIN_PASSWORD_LENGTH)
  newPassword: string;
}