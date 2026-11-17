// 'YYYY-MM-DD' en hora local.
// No se usa toISOString() porque devuelve la fecha en UTC: después de las 21 h en Argentina ya sería "mañana".
export function aIso(fecha: Date): string {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

// Convierte 'YYYY-MM-DD' en una fecha local.
// new Date('2026-11-17') la interpretaría en UTC y mostraría el día 16.
export function aFecha(iso: string): Date {
  const [anio, mes, dia] = iso.split('-').map(Number);
  return new Date(anio, mes - 1, dia);
}

export function sumarDias(fecha: Date, dias: number): Date {
  const resultado = new Date(fecha);
  resultado.setDate(resultado.getDate() + dias);
  return resultado;
}

export function diasEntre(desde: string, hasta: string): number {
  return Math.round((aFecha(hasta).getTime() - aFecha(desde).getTime()) / 86_400_000);
}

const formatoCorto = new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'short' });
const formatoLargo = new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });

export const fechaCorta = (iso: string) => formatoCorto.format(aFecha(iso)); // "17 nov"
export const fechaLarga = (iso: string) => formatoLargo.format(aFecha(iso)); // "17 de noviembre de 2026"