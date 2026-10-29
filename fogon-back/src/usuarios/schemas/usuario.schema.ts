import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';

export type Perfil = 'usuario' | 'administrador';

@Schema({ timestamps: true })
export class Usuario {
  @Prop({ required: true, trim: true })
  nombre: string;

  @Prop({ required: true, trim: true })
  apellido: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  correo: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  nombreUsuario: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({ required: true })
  fechaNacimiento: Date;

  @Prop({ default: '', maxlength: 200 })
  descripcion: string;

  @Prop({ default: '' })
  imagenPerfil: string;

  @Prop({ type: String, enum: ['usuario', 'administrador'], default: 'usuario' })
  perfil: Perfil;

  @Prop({ default: true })
  activo: boolean;
}

export type UsuarioDocument = HydratedDocument<Usuario>;
export const UsuarioSchema = SchemaFactory.createForClass(Usuario);