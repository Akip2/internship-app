import { IsEmail, IsEmpty, IsInt, IsNotEmpty, IsPhoneNumber, IsString, Length, MinLength } from "class-validator";

const MIN_LOGIN_LENGTH = 5;
const MIN_PASSWORD_LENGTH = 6;

export class LoginDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(MIN_LOGIN_LENGTH)
    login: string;

    @IsString()
    password: string;
}

export class CompanyRegisterDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(MIN_LOGIN_LENGTH)
    login: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(MIN_PASSWORD_LENGTH)
    password: string;

    @IsString()
    @IsNotEmpty()
    @Length(14)
    siret: string;

    @IsString()
    @IsEmail()
    @IsNotEmpty()
    mail: string;

    @IsString()
    @IsNotEmpty()
    @IsPhoneNumber("FR")
    phone: string;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    address: string;

    @IsString()
    @IsNotEmpty()
    sector: string;
}

export class UserFoundDto {
    @IsInt()
    @IsNotEmpty()
    user_id: number;

    @IsString()
    @IsNotEmpty()
    user_role: string;

    @IsString()
    @IsNotEmpty()
    password_hash: string;
}

export class UserDataDto {
    @IsInt()
    @IsNotEmpty()
    user_id: number;

    @IsString()
    @IsNotEmpty()
    user_role: string;
}