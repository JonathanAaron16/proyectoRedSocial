import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Usuario, type UsuarioDocument } from './schemas/usuario.schema.js';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectModel(Usuario.name) private readonly usuarioModel: Model<Usuario>,
  ) {}

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