import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Publicacion } from './schemas/publicacion.schema.js';
import { Comentario } from './schemas/comentario.schema.js';
import { RangoFechasDto } from './dto/rango-fechas.dto.js';

const ZONA = 'America/Argentina/Buenos_Aires';
const UN_DIA_MS = 24 * 60 * 60 * 1000;
const MAX_DIAS = 366;

interface Rango {
  desde: Date;
  hasta: Date;
}

@Injectable()
export class EstadisticasService {
  constructor(
    @InjectModel(Publicacion.name) private readonly publicacionModel: Model<Publicacion>,
    @InjectModel(Comentario.name) private readonly comentarioModel: Model<Comentario>,
  ) {}

  async publicacionesPorUsuario(dto: RangoFechasDto) {
    const { desde, hasta } = this.armarRango(dto);
    return this.publicacionModel.aggregate([
      { $match: { createdAt: { $gte: desde, $lte: hasta } } },
      { $group: { _id: '$autor', cantidad: { $sum: 1 } } },
      { $lookup: { from: 'usuarios', localField: '_id', foreignField: '_id', as: 'usuario' } },
      { $unwind: '$usuario' },
      {
        $project: {
          _id: 0,
          usuarioId: '$_id',
          nombreUsuario: '$usuario.nombreUsuario',
          nombre: { $concat: ['$usuario.nombre', ' ', '$usuario.apellido'] },
          cantidad: 1,
        },
      },
      { $sort: { cantidad: -1 } },
    ]);
  }

  async comentarios(dto: RangoFechasDto) {
    const rango = this.armarRango(dto);
    const resultados: { fecha: string; cantidad: number }[] = await this.comentarioModel.aggregate([
      { $match: { createdAt: { $gte: rango.desde, $lte: rango.hasta } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: ZONA } },
          cantidad: { $sum: 1 },
        },
      },
      { $project: { _id: 0, fecha: '$_id', cantidad: 1 } },
    ]);

    // Completa con 0 los días sin comentarios, para que la línea del gráfico sea continua
    const porFecha = new Map(resultados.map((r) => [r.fecha, r.cantidad]));
    const porDia: { fecha: string; cantidad: number }[] = [];
    for (let dia = rango.desde.getTime(); dia <= rango.hasta.getTime(); dia += UN_DIA_MS) {
      const fecha = this.formatear(new Date(dia));
      porDia.push({ fecha, cantidad: porFecha.get(fecha) ?? 0 });
    }

    const total = porDia.reduce((suma, d) => suma + d.cantidad, 0);
    return { total, porDia };
  }

  async comentariosPorPublicacion(dto: RangoFechasDto) {
    const { desde, hasta } = this.armarRango(dto);
    return this.comentarioModel.aggregate([
      { $match: { createdAt: { $gte: desde, $lte: hasta } } },
      { $group: { _id: '$publicacion', cantidad: { $sum: 1 } } },
      { $lookup: { from: 'publicaciones', localField: '_id', foreignField: '_id', as: 'publicacion' } },
      { $unwind: '$publicacion' },
      { $project: { _id: 0, publicacionId: '$_id', titulo: '$publicacion.titulo', cantidad: 1 } },
      { $sort: { cantidad: -1 } },
      { $limit: 8 },
    ]);
  }

  // Convierte "AAAA-MM-DD" en fechas reales: desde las 00:00 hasta las 23:59 (hora de Argentina)
  private armarRango(dto: RangoFechasDto): Rango {
    const hoy = this.formatear(new Date());
    const textoHasta = dto.hasta ?? hoy;
    const hasta = new Date(`${textoHasta}T23:59:59.999-03:00`);
    const desde = dto.desde
      ? new Date(`${dto.desde}T00:00:00-03:00`)
      : new Date(hasta.getTime() - 30 * UN_DIA_MS + 1);

    if (isNaN(desde.getTime()) || isNaN(hasta.getTime())) {
      throw new BadRequestException('Las fechas no son válidas');
    }
    if (desde > hasta) {
      throw new BadRequestException('La fecha "desde" no puede ser posterior a "hasta"');
    }
    if (hasta.getTime() - desde.getTime() > MAX_DIAS * UN_DIA_MS) {
      throw new BadRequestException(`El rango no puede superar los ${MAX_DIAS} días`);
    }
    return { desde, hasta };
  }

  // Fecha en formato AAAA-MM-DD según la hora de Argentina
  private formatear(fecha: Date) {
    return fecha.toLocaleDateString('en-CA', { timeZone: ZONA });
  }
}