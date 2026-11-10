const TIPOS_IMAGEN = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGEN = 2 * 1024 * 1024; // 2 MB, igual que el back

// Devuelve el mensaje de error, o null si la imagen es válida
export function validarImagen(archivo: File): string | null {
  if (!TIPOS_IMAGEN.includes(archivo.type)) return 'La imagen debe ser JPG, PNG o WEBP';
  if (archivo.size > MAX_IMAGEN) return 'La imagen no puede pesar más de 2 MB';
  return null;
}