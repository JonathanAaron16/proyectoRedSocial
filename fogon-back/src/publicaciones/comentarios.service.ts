import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comentario } from './schemas/comentario.schema.js';
import { Publicacion } from './schemas/publicacion.schema.js';
import { ComentarioDto } from './dto/comentario.dto.js';
import { ListarComentariosDto } from './dto/listar-comentarios.dto.js';
import { CAMPOS_AUTOR } from './constantes.js';

@Injectable()
export class ComentariosService {
  constructor(
    @InjectModel(Comentario.name) private readonly comentarioModel: Model<Comentario>,
    @InjectModel(Publicacion.name) private readonly publicacionModel: Model<Publicacion>,
  ) {}
  
  //Orden y paginación como pide la consigna: sort({ createdAt: -1 }) 
  // trae primero los más recientes, y skip/limit hacen la paginación. 

  async listar(publicacionId: Types.ObjectId, query: ListarComentariosDto) {
    await this.verificarPublicacion(publicacionId);

    const filtro = { publicacion: publicacionId };
    const [comentarios, total] = await Promise.all([
      this.comentarioModel
        .find(filtro)
        .sort({ createdAt: -1 })
        .skip(query.offset)
        .limit(query.limit)
        .populate('autor', CAMPOS_AUTOR)
        .lean(),
      this.comentarioModel.countDocuments(filtro),
    ]);

    return { comentarios, total };
  }

  async crear(publicacionId: Types.ObjectId, dto: ComentarioDto, autorId: string) {
    await this.verificarPublicacion(publicacionId);

    const comentario = await this.comentarioModel.create({
      publicacion: publicacionId,
      autor: autorId,
      mensaje: dto.mensaje,
    });
    await this.publicacionModel.updateOne({ _id: publicacionId }, { $inc: { cantidadComentarios: 1 } });

    await comentario.populate('autor', CAMPOS_AUTOR);
    return comentario.toObject();
  }

  async editar(publicacionId: Types.ObjectId, comentarioId: Types.ObjectId, dto: ComentarioDto, usuarioId: string) {
    await this.verificarPublicacion(publicacionId);

    const comentario = await this.comentarioModel.findOne({ _id: comentarioId, publicacion: publicacionId });
    if (!comentario) {
      throw new NotFoundException('El comentario no existe');
    }
    if (comentario.autor.toString() !== usuarioId) {
      throw new ForbiddenException('Solo podés editar tus propios comentarios');
    }

    comentario.mensaje = dto.mensaje;
    comentario.modificado = true;
    await comentario.save();

    await comentario.populate('autor', CAMPOS_AUTOR);
    return comentario.toObject();
  }

  // No se puede comentar ni ver comentarios de una publicación eliminada o inexistente
  private async verificarPublicacion(id: Types.ObjectId) {
    const existe = await this.publicacionModel.exists({ _id: id, activo: true });
    if (!existe) {
      throw new NotFoundException('La publicación no existe');
    }
  }
}