import { LOCALE_ID, Pipe, PipeTransform, inject } from '@angular/core';

@Pipe({ name: 'plural' })
export class PluralPipe implements PipeTransform {
  private locale = inject(LOCALE_ID);

  transform(cantidad: number | null | undefined, singular: string, plural = singular + 's'): string {
    const n = cantidad ?? 0;
    // Notación compacta: 1200 → "1,2 mil", 1500000 → "1,5 M"
    const numero = new Intl.NumberFormat(this.locale, { notation: 'compact', maximumFractionDigits: 1 }).format(n);
    return `${numero} ${n === 1 ? singular : plural}`;
  }
}