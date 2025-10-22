import { IsEmail, IsString, isString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  rut: string;

  @IsString()
  nombre: string;

  @IsString()
  apellido: string;

  @IsString()
  password: string;

  @IsEmail()
  email: string;
}
