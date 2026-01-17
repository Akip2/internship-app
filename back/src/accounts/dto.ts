import { IsEmail, IsEmpty, IsNotEmpty, IsOptional, IsString, IsBoolean, MinLength } from 'class-validator';
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

export class CreateStudentDto extends CreateAccountDto {
  @IsString()
  @IsNotEmpty()
  level: string;

  @IsString()
  @IsNotEmpty()
  birthDate: string;

  @IsString()
  @IsOptional()
  statut_etu?: string;

  @IsBoolean()
  @IsOptional()
  visibilite_infos?: boolean;
}