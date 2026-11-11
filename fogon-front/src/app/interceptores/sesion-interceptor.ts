import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { Sesion } from '../servicios/sesion';

// Rutas donde un 401 es una respuesta esperada y la maneja la propia pantalla
const RUTAS_EXCLUIDAS = ['/auth/login', '/auth/registro', '/auth/autorizar'];

export const sesionInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const sesion = inject(Sesion);

  return next(req).pipe(
    catchError((error: unknown) => {
      const excluida = RUTAS_EXCLUIDAS.some((ruta) => req.url.includes(ruta));
      if (error instanceof HttpErrorResponse && error.status === 401 && !excluida) {
        sesion.cerrar();
        router.navigate(['/login'], { queryParams: { motivo: 'sesion-vencida' } });
      }
      return throwError(() => error);
    }),
  );
};