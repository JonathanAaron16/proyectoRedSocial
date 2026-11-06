import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Publicacion } from './schemas/publicacion.schema.js';
import { CrearPublicacionDto } from './dto/crear-publicacion.dto.js';
import { ListarPublicacionesDto } from './dto/listar-publicaciones.dto.js';
import { ImagenesService } from '../imagenes/imagenes.service.js';
import type { PayloadToken } from '../auth/payload-token.js';


// Datos del autor que viajan con cada publicación 
const CAMPOS_AUTOR = 'nombre apellido nombreUsuario imagenPerfil';

@Injectable()
export class PublicacionesService {
  constructor(
    @InjectModel(Publicacion.name) private readonly publicacionModel: Model<Publicacion>,
    private readonly imagenesService: ImagenesService,
  ) {}

  async crear(dto: CrearPublicacionDto, autorId: string, imagen?: Express.Multer.File) {
    const urlImagen = imagen ? await this.imagenesService.subir(imagen, 'publicaciones') : '';

    const publicacion = await this.publicacionModel.create({
      titulo: dto.titulo,
      mensaje: dto.mensaje,
      imagen: urlImagen,
      autor: autorId,
    });
    await publicacion.populate('autor', CAMPOS_AUTOR);

    return this.aRespuesta(publicacion.toObject(), false);
  }

  async listar(query: ListarPublicacionesDto, usuarioId: string) {
    const filtro: Record<string, unknown> = { activo: true };
    if (query.usuario) filtro.autor = query.usuario;

    const orden: Record<string, 1 | -1> =
      query.orden === 'likes' ? { cantidadLikes: -1, createdAt: -1 } : { createdAt: -1 };

    const [publicaciones, total] = await Promise.all([
      this.publicacionModel
        .find(filtro)
        .sort(orden)
        .skip(query.offset)
        .limit(query.limit)
        .select({
          titulo: 1,
          mensaje: 1,
          imagen: 1,
          autor: 1,
          cantidadLikes: 1,
          createdAt: 1,
          // De todo el array de likes, trae solo el del usuario actual (si existe)
          likes: { $elemMatch: { usuario: new Types.ObjectId(usuarioId) } },
        })
        .populate('autor', CAMPOS_AUTOR)
        .lean(),
      this.publicacionModel.countDocuments(filtro),
    ]);

    return {
      publicaciones: publicaciones.map((p) => this.aRespuesta(p, (p.likes?.length ?? 0) > 0)),
      total,
    };
  }

  // Saca el array de likes y agrega "meGusta": si el usuario actual ya dio me gusta
  private aRespuesta<T extends { likes?: unknown }>(publicacion: T, meGusta: boolean) {
    const { likes, ...resto } = publicacion;
    return { ...resto, meGusta };
  }

  async eliminar(id: Types.ObjectId, usuario: PayloadToken) {
    const publicacion = await this.publicacionModel
      .findOne({ _id: id, activo: true })
      .select('autor')
      .lean();

    if (!publicacion) {
      throw new NotFoundException('La publicación no existe');
    }

    const esAutor = publicacion.autor.toString() === usuario.sub;
    if (!esAutor && usuario.perfil !== 'administrador') {
      throw new ForbiddenException('Solo podés eliminar tus propias publicaciones');
    }

    await this.publicacionModel.updateOne({ _id: id }, { activo: false });
  }

  async darMeGusta(id: Types.ObjectId, usuarioId: string) {
    const actualizada = await this.publicacionModel.findOneAndUpdate(
      // Solo si está activa y el usuario TODAVÍA NO dio me gusta
      { _id: id, activo: true, 'likes.usuario': { $ne: usuarioId } },
      { $push: { likes: { usuario: usuarioId } }, $inc: { cantidadLikes: 1 } },
      { returnDocument: 'after', projection: { cantidadLikes: 1 } },
    );

    if (!actualizada) {
      await this.verificarQueExiste(id);
      throw new ConflictException('Ya le diste me gusta a esta publicación');
    }
    return { cantidadLikes: actualizada.cantidadLikes, meGusta: true };
  }

  async quitarMeGusta(id: Types.ObjectId, usuarioId: string) {
    const actualizada = await this.publicacionModel.findOneAndUpdate(
      // Solo si está activa y el usuario SÍ había dado me gusta
      { _id: id, activo: true, 'likes.usuario': usuarioId },
      { $pull: { likes: { usuario: usuarioId } }, $inc: { cantidadLikes: -1 } },
      { returnDocument: 'after', projection: { cantidadLikes: 1 } },
    );

    if (!actualizada) {
      await this.verificarQueExiste(id);
      throw new ConflictException('No le habías dado me gusta a esta publicación');
    }
    return { cantidadLikes: actualizada.cantidadLikes, meGusta: false };
  }

  private async verificarQueExiste(id: Types.ObjectId) {
    const existe = await this.publicacionModel.exists({ _id: id, activo: true });
    if (!existe) {
      throw new NotFoundException('La publicación no existe');
    }
  }
}