import { HttpErrorResponse } from '@angular/common/http';

// Convierte cualquier error de una request en un mensaje para mostrarle al usuario
export function mensajeDeError(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) {
      return 'No pudimos conectarnos con el servidor. Revisá tu conexión e intentá de nuevo.';
    }
    const mensaje = error.error?.message;
    if (Array.isArray(mensaje)) return mensaje.join('\n');
    if (typeof mensaje === 'string') return mensaje;
  }
  return 'Ocurrió un error inesperado. Intentá de nuevo.';
}