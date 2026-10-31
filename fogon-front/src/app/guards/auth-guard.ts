import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../servicios/auth';
import { Sesion } from '../servicios/sesion';

// Deja pasar solo si hay sesión. Si la página se recargó, le pregunta al back por la cookie.
export const authGuard: CanActivateFn = async () => {
  const sesion = inject(Sesion);
  const auth = inject(Auth);
  const router = inject(Router);

  if (sesion.logueado()) {
    return true;
  }

  try {
    const usuario = await auth.autorizar();
    sesion.iniciar(usuario);
    return true;
  } catch {
    return router.createUrlTree(['/login']);
  }
};