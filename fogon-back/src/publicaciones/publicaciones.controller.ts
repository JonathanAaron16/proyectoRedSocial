import {
  Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Query,
  UploadedFile, UseGuards, UseInterceptors,
} from '@nestjs/common';
import { ParseObjectIdPipe } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { FileInterceptor } from '@nestjs/platform-express';
import { PublicacionesService } from './publicaciones.service.js';
import { CrearPublicacionDto } from './dto/crear-publicacion.dto.js';
import { ListarPublicacionesDto } from './dto/listar-publicaciones.dto.js';
import { AuthGuard } from '../auth/guards/auth.guard.js';
import { UsuarioActual } from '../auth/usuario-actual.decorator.js';
import type { PayloadToken } from '../auth/payload-token.js';
import { opcionesImagen } from '../imagenes/opciones-imagen.js';

@Controller('publicaciones')
@UseGuards(AuthGuard)
export class PublicacionesController {
  constructor(private readonly publicacionesService: PublicacionesService) {}

  @Post()
  @UseInterceptors(FileInterceptor('imagen', opcionesImagen))
  crear(
    @Body() dto: CrearPublicacionDto,
    @UploadedFile() imagen: Express.Multer.File | undefined,
    @UsuarioActual() usuario: PayloadToken,
  ) {
    return this.publicacionesService.crear(dto, usuario.sub, imagen);
  }

  @Get()
  listar(@Query() query: ListarPublicacionesDto, @UsuarioActual() usuario: PayloadToken) {
    return this.publicacionesService.listar(query, usuario.sub);
  }

  @Get(':id')
  obtener(@Param('id', ParseObjectIdPipe) id: Types.ObjectId, @UsuarioActual() usuario: PayloadToken) {
    return this.publicacionesService.obtener(id, usuario.sub);
  }
  
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  eliminar(@Param('id', ParseObjectIdPipe) id: Types.ObjectId, @UsuarioActual() usuario: PayloadToken) {
    return this.publicacionesService.eliminar(id, usuario);
  }

  @Post(':id/me-gusta')
  darMeGusta(@Param('id', ParseObjectIdPipe) id: Types.ObjectId, @UsuarioActual() usuario: PayloadToken) {
    return this.publicacionesService.darMeGusta(id, usuario.sub);
  }

  @Delete(':id/me-gusta')
  quitarMeGusta(@Param('id', ParseObjectIdPipe) id: Types.ObjectId, @UsuarioActual() usuario: PayloadToken) {
    return this.publicacionesService.quitarMeGusta(id, usuario.sub);
  }
}