import { Body, Controller, HttpCode, HttpStatus, Post, Res, UseGuards ,BadRequestException,UploadedFile,UseInterceptors} from '@nestjs/common';
import type { CookieOptions, Response } from 'express';
import { AuthService } from './auth.service.js';
import { RegistroDto } from './dto/registro.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { AuthGuard } from './guards/auth.guard.js';
import { UsuarioActual } from './usuario-actual.decorator.js';
import type { PayloadToken } from './payload-token.js';
import { FileInterceptor } from '@nestjs/platform-express';
import { opcionesImagen } from '../imagenes/opciones-imagen.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

@Post('registro')
  @UseInterceptors(FileInterceptor('imagen', opcionesImagen))
  async registro(
    @Body() dto: RegistroDto,
    @UploadedFile() imagen: Express.Multer.File,
    @Res({ passthrough: true }) res: Response,
  ) {
    // if (!imagen) {
    //   throw new BadRequestException('La imagen de perfil es obligatoria');
    // }
    const { token, usuario } = await this.authService.registro(dto, imagen);
    res.cookie('token', token, this.opcionesCookie());
    return usuario;
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { token, usuario } = await this.authService.login(dto);
    res.cookie('token', token, this.opcionesCookie());
    return usuario;
  }

  @Post('autorizar')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  autorizar(@UsuarioActual() usuario: PayloadToken) {
    return this.authService.autorizar(usuario.sub);
  }

  @Post('refrescar')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async refrescar(@UsuarioActual() usuario: PayloadToken, @Res({ passthrough: true }) res: Response) {
    const { token, usuario: datos } = await this.authService.refrescar(usuario.sub);
    res.cookie('token', token, this.opcionesCookie());
    return datos;
  }

  @Post('cerrar-sesion')
  // no_content: no devuelve nada, pero el status 204 indica que la operación fue exitosa
  @HttpCode(HttpStatus.NO_CONTENT)
  cerrarSesion(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('token', this.opcionesCookie());
  }
// Configuración de la cookie que almacena el token JWT
  private opcionesCookie(): CookieOptions {
    return {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 1000 * 60 * 2,// 
    };
  }
}