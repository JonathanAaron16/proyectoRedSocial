import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Publicacion } from './schemas/publicacion.schema.js';
import { CrearPublicacionDto } from './dto/crear-publicacion.dto.js';
import { ListarPublicacionesDto } from './dto/listar-publicaciones.dto.js';
import { ImagenesService } from '../imagenes/imagenes.service.js';

// Datos del autor que viajan con cada publicación (nunca la contraseña ni el correo)
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
}