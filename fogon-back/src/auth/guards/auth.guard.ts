import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import type { PayloadToken } from '../payload-token.js';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { usuario?: PayloadToken }>();

    const token = request.cookies?.token;
    if (!token) {
      throw new UnauthorizedException('No hay sesión iniciada');
    }

    try {
      request.usuario = await this.jwtService.verifyAsync<PayloadToken>(token);
    } catch {
      throw new UnauthorizedException('La sesión expiró o no es válida');
    }
    return true;
  }
}