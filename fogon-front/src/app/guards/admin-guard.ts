import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Sesion } from '../servicios/sesion';

// Va en rutas hijas de Principal: el authGuard ya garantizó que hay sesión
export const adminGuard: CanActivateFn = () => {
  const sesion = inject(Sesion);
  const router = inject(Router);
  return sesion.esAdmin() ? true : router.createUrlTree(['/publicaciones']);
};