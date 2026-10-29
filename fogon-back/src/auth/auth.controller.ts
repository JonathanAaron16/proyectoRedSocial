import { Body, Controller, HttpCode, HttpStatus, Post, Res, UseGuards } from '@nestjs/common';
import type { CookieOptions, Response } from 'express';
import { AuthService } from './auth.service.js';
import { RegistroDto } from './dto/registro.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { AuthGuard } from './guards/auth.guard.js';
import { UsuarioActual } from './usuario-actual.decorator.js';
import type { PayloadToken } from './payload-token.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('registro')
  async registro(@Body() dto: RegistroDto, @Res({ passthrough: true }) res: Response) {
    const { token, usuario } = await this.authService.registro(dto);
    res.cookie('token', token, this.opcionesCookie());
    return usuario;
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
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

  @Post('cerrar-sesion')
  @HttpCode(HttpStatus.NO_CONTENT)
  cerrarSesion(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('token', this.opcionesCookie());
  }

  private opcionesCookie(): CookieOptions {
    const produccion = process.env.NODE_ENV === 'production';
    return {
      httpOnly: true,
      secure: produccion,
      sameSite: produccion ? 'none' : 'lax',
      maxAge: 1000 * 60 * 15,
    };
  }
}