import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';
import { UsuariosService } from '../usuarios/usuarios.service.js';
import { RegistroDto } from './dto/registro.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { DURACION_SESION_SEGUNDOS } from './constantes.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService,
  ) {}

  async registro(dto: RegistroDto, imagen?: Express.Multer.File) {
    const usuario = await this.usuariosService.registrar(dto, imagen);
    return this.armarRespuesta(usuario);
  }

  async login(dto: LoginDto) {
    
    const usuario = await this.usuariosService.buscarParaLogin(dto.identificador);

    // Mismo mensaje si no existe o si la contraseña está mal: no le damos pistas a un atacante
    if (!usuario || !(await compare(dto.password, usuario.password))) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
    }

    if (!usuario.activo) {
      throw new ForbiddenException('Tu cuenta está deshabilitada');
    }

    return this.armarRespuesta(this.usuariosService.sinPassword(usuario));
  }

  private async armarRespuesta(usuario: { _id: unknown; nombreUsuario: string; perfil: string }) {
    const payload = {
      sub: String(usuario._id),
      nombreUsuario: usuario.nombreUsuario,
      perfil: usuario.perfil,
    };
    const token = await this.jwtService.signAsync(payload);
    return { token, usuario, expiraEnSegundos: DURACION_SESION_SEGUNDOS };
  }

  async autorizar(id: string) {
    const usuario = await this.usuariosService.buscarPorId(id);
    if (!usuario || !usuario.activo) {
      throw new UnauthorizedException('La sesión ya no es válida');
    }
    return usuario;
  }
  
  async refrescar(id: string) {
    // Reutiliza autorizar: si el usuario ya no existe o fue deshabilitado, responde 401
    const usuario = await this.autorizar(id);
    return this.armarRespuesta(this.usuariosService.sinPassword(usuario));
  }

}