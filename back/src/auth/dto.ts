import { IsInt, IsString } from "class-validator";

export class LoginDto {
    @IsString()
    login: string;

    @IsString()
    password: string;
}

export class UserFoundDto {
    @IsInt()
    user_id: number;

    @IsString()
    user_role: string;

    @IsString()
    password_hash: string;
}

export class UserDataDto {
    @IsInt()
    user_id: number;

    @IsString()
    user_role: string;
}