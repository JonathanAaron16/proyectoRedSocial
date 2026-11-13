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
import { DURACION_SESION_SEGUNDOS } from './constantes.js';

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
     const { token, usuario, expiraEnSegundos } = await this.authService.registro(dto, imagen);
    res.cookie('token', token, this.opcionesCookie());
    return { usuario, expiraEnSegundos };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { token, usuario, expiraEnSegundos } = await this.authService.login(dto);
    res.cookie('token', token, this.opcionesCookie());
    return { usuario, expiraEnSegundos };
  }

  @Post('autorizar')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async autorizar(@UsuarioActual() payload: PayloadToken) {
    const usuario = await this.authService.autorizar(payload.sub);
    // Lo que le queda al token ACTUAL (no se renueva acá)
    const expiraEnSegundos = Math.max(0, (payload.exp ?? 0) - Math.floor(Date.now() / 1000));
    return { usuario, expiraEnSegundos };
  }

  @Post('refrescar')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async refrescar(@UsuarioActual() payload: PayloadToken, @Res({ passthrough: true }) res: Response) {
    const { token, usuario, expiraEnSegundos } = await this.authService.refrescar(payload.sub);
    res.cookie('token', token, this.opcionesCookie());
    return { usuario, expiraEnSegundos };
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
      maxAge: DURACION_SESION_SEGUNDOS// 
    };
  }
}