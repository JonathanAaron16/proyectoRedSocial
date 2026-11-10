import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ParseObjectIdPipe } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { ComentariosService } from './comentarios.service.js';
import { ComentarioDto } from './dto/comentario.dto.js';
import { ListarComentariosDto } from './dto/listar-comentarios.dto.js';
import { AuthGuard } from '../auth/guards/auth.guard.js';
import { UsuarioActual } from '../auth/usuario-actual.decorator.js';
import type { PayloadToken } from '../auth/payload-token.js';

@Controller('publicaciones/:publicacionId/comentarios')
@UseGuards(AuthGuard)
export class ComentariosController {
  constructor(private readonly comentariosService: ComentariosService) {}

  @Get()
  listar(
    @Param('publicacionId', ParseObjectIdPipe) publicacionId: Types.ObjectId,
    @Query() query: ListarComentariosDto,
  ) {
    return this.comentariosService.listar(publicacionId, query);
  }

  @Post()
  crear(
    @Param('publicacionId', ParseObjectIdPipe) publicacionId: Types.ObjectId,
    @Body() dto: ComentarioDto,
    @UsuarioActual() usuario: PayloadToken,
  ) {
    return this.comentariosService.crear(publicacionId, dto, usuario.sub);
  }

  @Put(':comentarioId')
  editar(
    @Param('publicacionId', ParseObjectIdPipe) publicacionId: Types.ObjectId,
    @Param('comentarioId', ParseObjectIdPipe) comentarioId: Types.ObjectId,
    @Body() dto: ComentarioDto,
    @UsuarioActual() usuario: PayloadToken,
  ) {
    return this.comentariosService.editar(publicacionId, comentarioId, dto, usuario.sub);
  }
}