import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { hash } from 'bcryptjs';
import { Usuario, type Perfil, type UsuarioDocument } from './schemas/usuario.schema.js';
import { ImagenesService } from '../imagenes/imagenes.service.js';
import { RegistroDto } from '../auth/dto/registro.dto.js';

@Injectable()
export class UsuariosService {
   constructor(
    @InjectModel(Usuario.name) private readonly usuarioModel: Model<Usuario>,
    private readonly imagenesService: ImagenesService,
  ) {}

    // Lo usan el registro (perfil "usuario") y el admin (elige el perfil)
  async registrar(dto: RegistroDto, imagen?: Express.Multer.File, perfil: Perfil = 'usuario') {
    await this.verificarDisponible(dto.correo, dto.nombreUsuario);

    const passwordEncriptada = await hash(dto.password, 10);
    const imagenPerfil = imagen
      ? await this.imagenesService.subir(imagen, 'perfiles')
      : process.env.IMAGEN_PERFIL_DEFECTO!;

    return this.crear({
      nombre: dto.nombre,
      apellido: dto.apellido,
      correo: dto.correo,
      nombreUsuario: dto.nombreUsuario,
      password: passwordEncriptada,
      fechaNacimiento: new Date(dto.fechaNacimiento),
      descripcion: dto.descripcion ?? '',
      imagenPerfil,
      perfil,
    });
  }

  listar() {
    return this.usuarioModel.find().sort({ createdAt: -1 }).lean();
  }

  async cambiarEstado(id: Types.ObjectId, activo: boolean, adminId: string) {
    if (!activo && id.toString() === adminId) {
      throw new BadRequestException('No podés deshabilitar tu propia cuenta');
    }

    const usuario = await this.usuarioModel
      .findByIdAndUpdate(id, { activo }, { returnDocument: 'after' })
      .lean();

    if (!usuario) {
      throw new NotFoundException('El usuario no existe');
    }
    return usuario;
  }

  async crear(datos: Partial<Usuario>) {
    try {
      const usuario = await this.usuarioModel.create(datos);
      return this.sinPassword(usuario);
    } catch (error: any) {
      // 11000 = clave duplicada (violó un índice unique)
      if (error?.code === 11000) {
        const campo = Object.keys(error.keyPattern ?? {})[0];
        throw new ConflictException(
          campo === 'correo'
            ? 'Ese correo ya está registrado'
            : 'Ese nombre de usuario ya está en uso',
        );
      }
      throw error;
    }
  }
  
  async verificarDisponible(correo: string, nombreUsuario: string) {
    const correoNorm = correo.trim().toLowerCase();
    const usuarioNorm = nombreUsuario.trim().toLowerCase();

    const existente = await this.usuarioModel.findOne({
      $or: [{ correo: correoNorm }, { nombreUsuario: usuarioNorm }],
    });

    if (existente) {
      throw new ConflictException(
        existente.correo === correoNorm
          ? 'Ese correo ya está registrado'
          : 'Ese nombre de usuario ya está en uso',
      );
    }
  }

  // Busca por correo O por nombre de usuario, e incluye la contraseña (para comparar en el login)
  buscarParaLogin(identificador: string) {
    const valor = identificador.trim().toLowerCase();
    return this.usuarioModel
      .findOne({ $or: [{ correo: valor }, { nombreUsuario: valor }] })
      .select('+password');
  }

  buscarPorId(id: string) {
    return this.usuarioModel.findById(id);
  }

  // Convierte el documento a objeto plano y le saca la contraseña
  sinPassword(usuario: UsuarioDocument) {
    const { password, ...resto } = usuario.toObject();
    return resto;
  }
}