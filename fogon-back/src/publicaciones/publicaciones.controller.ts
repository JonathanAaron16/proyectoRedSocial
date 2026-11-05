import { Body, Controller, Get, Post, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
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
}