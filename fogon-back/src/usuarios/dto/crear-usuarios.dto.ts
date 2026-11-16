import { IsIn, IsOptional } from 'class-validator';
import { RegistroDto } from '../../auth/dto/registro.dto.js';

// Los mismos datos que el registro, más el perfil
export class CrearUsuarioDto extends RegistroDto {
  @IsOptional()
  @IsIn(['usuario', 'administrador'], { message: 'El perfil debe ser "usuario" o "administrador"' })
  perfil?: 'usuario' | 'administrador';
}