import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import type { Request } from 'express';
import type { PayloadToken } from '../payload-token.js';

// Se usa DESPUÉS de AuthGuard: el usuario ya está validado; acá solo se revisa el rol
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request & { usuario?: PayloadToken }>();
    if (request.usuario?.perfil !== 'administrador') {
      throw new ForbiddenException('Solo un administrador puede hacer esto');
    }
    return true;
  }
}