import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CrearPublicacionDto {
  @IsString()
  @IsNotEmpty({ message: 'El título es obligatorio' })
  @MaxLength(100, { message: 'El título puede tener hasta 100 caracteres' })
  titulo: string;

  @IsString()
  @IsNotEmpty({ message: 'El mensaje es obligatorio' })
  @MaxLength(2000, { message: 'El mensaje puede tener hasta 2000 caracteres' })
  mensaje: string;
}