import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';
import { UsuariosService } from '../usuarios/usuarios.service.js';
import { RegistroDto } from './dto/registro.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { ImagenesService } from '../imagenes/imagenes.service.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly imagenesService: ImagenesService,
    private readonly jwtService: JwtService,
  ) {}

  async registro(dto: RegistroDto, imagen: Express.Multer.File) {
    await this.usuariosService.verificarDisponible(dto.correo, dto.nombreUsuario);

    const passwordEncriptada = await hash(dto.password, 10);
    //const imagenPerfil = await this.imagenesService.subir(imagen, 'perfiles');

    // Si no se sube una imagen, usar la imagen por defecto
      const imagenPerfil = imagen
    ? await this.imagenesService.subir(imagen, 'perfiles')
    : process.env.IMAGEN_PERFIL_DEFECTO!;

    const usuario = await this.usuariosService.crear({
      nombre: dto.nombre,
      apellido: dto.apellido,
      correo: dto.correo,
      nombreUsuario: dto.nombreUsuario,
      password: passwordEncriptada,
      fechaNacimiento: new Date(dto.fechaNacimiento),
      descripcion: dto.descripcion ?? '',
      imagenPerfil,
    });

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
    return { token, usuario };
  }

  async autorizar(id: string) {
    const usuario = await this.usuariosService.buscarPorId(id);
    if (!usuario || !usuario.activo) {
      throw new UnauthorizedException('La sesión ya no es válida');
    }
    return usuario;
  }

}