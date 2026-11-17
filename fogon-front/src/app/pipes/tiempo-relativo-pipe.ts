import { LOCALE_ID, Pipe, PipeTransform, inject } from '@angular/core';
import { formatDate } from '@angular/common';

@Pipe({ name: 'tiempoRelativo' })
export class TiempoRelativoPipe implements PipeTransform {
  private locale = inject(LOCALE_ID);

  transform(valor: string | Date | null | undefined): string {
    if (!valor) return '';
    const fecha = new Date(valor);
    const segundos = Math.floor((Date.now() - fecha.getTime()) / 1000);

    if (segundos < 60) return 'recién';
    const minutos = Math.floor(segundos / 60);
    if (minutos < 60) return `hace ${minutos} min`;
    const horas = Math.floor(minutos / 60);
    if (horas < 24) return `hace ${horas} h`;
    const dias = Math.floor(horas / 24);
    if (dias === 1) return 'ayer';
    if (dias < 7) return `hace ${dias} días`;

    // Más de una semana: fecha corta, con el año solo si no es el actual
    const mismoAnio = fecha.getFullYear() === new Date().getFullYear();
    return formatDate(fecha, mismoAnio ? 'd MMM' : 'd MMM y', this.locale);
  }
}