import {
  Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post,
  UploadedFile, UseGuards, UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ParseObjectIdPipe } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { UsuariosService } from './usuarios.service.js';
import { CrearUsuarioDto } from './dto/crear-usuarios.dto.js';
import { AuthGuard } from '../auth/guards/auth.guard.js';
import { AdminGuard } from '../auth/guards/admin.guard.js';
import { UsuarioActual } from '../auth/usuario-actual.decorator.js';
import type { PayloadToken } from '../auth/payload-token.js';
import { opcionesImagen } from '../imagenes/opciones-imagen.js';

@Controller('usuarios')
@UseGuards(AuthGuard, AdminGuard)
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get()
  listar() {
    return this.usuariosService.listar();
  }

  @Post()
  @UseInterceptors(FileInterceptor('imagen', opcionesImagen))
  crear(@Body() dto: CrearUsuarioDto, @UploadedFile() imagen: Express.Multer.File | undefined) {
    return this.usuariosService.registrar(dto, imagen, dto.perfil ?? 'usuario');
  }

  @Delete(':id')
  deshabilitar(@Param('id', ParseObjectIdPipe) id: Types.ObjectId, @UsuarioActual() admin: PayloadToken) {
    return this.usuariosService.cambiarEstado(id, false, admin.sub);
  }

  @Post(':id/habilitar')
  @HttpCode(HttpStatus.OK)
  habilitar(@Param('id', ParseObjectIdPipe) id: Types.ObjectId, @UsuarioActual() admin: PayloadToken) {
    return this.usuariosService.cambiarEstado(id, true, admin.sub);
  }
}