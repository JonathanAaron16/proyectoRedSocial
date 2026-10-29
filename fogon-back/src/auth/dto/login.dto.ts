import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty({ message: 'Ingresá tu correo o nombre de usuario' })
  identificador: string;

  @IsString()
  @IsNotEmpty({ message: 'Ingresá la contraseña' })
  password: string;
}