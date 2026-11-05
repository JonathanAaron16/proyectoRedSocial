import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, type HydratedDocument } from 'mongoose';
import { Usuario } from '../../usuarios/schemas/usuario.schema.js';

// Cada me gusta guarda quién y cuándo (las estadísticas del Sprint 5 lo usan)
@Schema({ _id: false })
export class MeGusta {
  @Prop({ type: Types.ObjectId, ref: Usuario.name, required: true })
  usuario: Types.ObjectId;

  @Prop({ default: Date.now })
  fecha: Date;
}
const MeGustaSchema = SchemaFactory.createForClass(MeGusta);
//collection: 'publicaciones': sin esto, Mongoose arma el plural en inglés y la colección se llamaría publicacions
@Schema({ timestamps: true, collection: 'publicaciones' })
export class Publicacion {
  @Prop({ required: true, trim: true, maxlength: 100 })
  titulo: string;

  @Prop({ required: true, trim: true, maxlength: 2000 })
  mensaje: string;

  @Prop({ default: '' })
  imagen: string;

  @Prop({ type: Types.ObjectId, ref: Usuario.name, required: true, index: true })
  autor: Types.ObjectId;

  @Prop({ type: [MeGustaSchema], default: [] })
  likes: MeGusta[];

  @Prop({ default: 0 })
  cantidadLikes: number;

  @Prop({ default: true })
  activo: boolean;
}
//
export type PublicacionDocument = HydratedDocument<Publicacion>;
export const PublicacionSchema = SchemaFactory.createForClass(Publicacion);

// Índices para que los dos ordenamientos sean rápidos
PublicacionSchema.index({ activo: 1, createdAt: -1 });
PublicacionSchema.index({ activo: 1, cantidadLikes: -1, createdAt: -1 });