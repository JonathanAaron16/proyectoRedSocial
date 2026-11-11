import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Sesion } from '../servicios/sesion';

// Si hay sesión, deja pasar. Si no, va a la pantalla de cargando, que valida el token
// y después vuelve a la ruta que se quería ver.
export const authGuard: CanActivateFn = (_route, state) => {
  const sesion = inject(Sesion);
  const router = inject(Router);

  if (sesion.logueado()) {
    return true;
  }
  return router.createUrlTree(['/cargando'], { queryParams: { volver: state.url } });
};