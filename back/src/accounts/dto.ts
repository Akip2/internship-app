import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateAccountDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsEmail()
  mail: string;

  @IsString()
  @IsNotEmpty()
  phone: string;
}