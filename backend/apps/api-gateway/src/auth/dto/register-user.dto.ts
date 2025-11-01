import { IsEmail, IsString, IsStrongPassword } from "class-validator"

export class RegisterUserDto {

    @IsString()
    nombre:string;

    @IsString()
    apellido: string;

    @IsString()
    @IsEmail()
    email:string;

    @IsString()
    @IsStrongPassword()
    password:string;

    @IsString()
    rut: string;


} 