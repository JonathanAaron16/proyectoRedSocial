import { Pipe, PipeTransform } from '@angular/core';
import { calcularEdad } from '../utils/fechas';

const RAMAS = [
  { desde: 22, nombre: 'Adultos' },
  { desde: 18, nombre: 'Rovers' },
  { desde: 14, nombre: 'Caminantes' },
  { desde: 10, nombre: 'Unidad Scout' },
  { desde: 7, nombre: 'Manada' },
];

@Pipe({ name: 'rama' })
export class RamaPipe implements PipeTransform {
  transform(fechaNacimiento: string | Date | null | undefined, mostrarEdad = false): string {
    if (!fechaNacimiento) return '';
    const edad = calcularEdad(fechaNacimiento);
    const rama = RAMAS.find((r) => edad >= r.desde)?.nombre ?? 'Sin rama';
    return mostrarEdad ? `${rama} · ${edad} años` : rama;
  }
}