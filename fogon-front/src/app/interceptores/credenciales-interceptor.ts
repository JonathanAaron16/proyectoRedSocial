import { HttpInterceptorFn } from '@angular/common/http';

// Hace que TODAS las requests manden y reciban la cookie del token
export const credencialesInterceptor: HttpInterceptorFn = (req, next) =>
  next(req.clone({ withCredentials: true }));