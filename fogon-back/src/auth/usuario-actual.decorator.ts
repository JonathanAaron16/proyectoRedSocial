import { createParamDecorator, ExecutionContext } from '@nestjs/common';
// Decorador para obtener el usuario actual de la request
export const UsuarioActual = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => ctx.switchToHttp().getRequest().usuario,
);