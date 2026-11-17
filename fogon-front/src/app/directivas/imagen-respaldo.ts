import { Directive, ElementRef, inject, input } from '@angular/core';

const IMAGEN_POR_DEFECTO = 'icons/icon-192x192.png';

@Directive({
  selector: 'img[appImagenRespaldo]',
  host: { '(error)': 'alFallar()' },
})
export class ImagenRespaldo {
  // Sin valor: muestra la llama. Con "ocultar": esconde la imagen. Con otra URL: muestra esa.
  respaldo = input('', { alias: 'appImagenRespaldo' });

  private img = inject<ElementRef<HTMLImageElement>>(ElementRef).nativeElement;
  private yaFallo = false;

  alFallar() {
    // Si el respaldo también falla, no vuelve a intentar: evita un bucle infinito de errores
    if (this.yaFallo) return;
    this.yaFallo = true;

    const respaldo = this.respaldo();
    if (respaldo === 'ocultar') {
      this.img.style.display = 'none';
    } else {
      this.img.src = respaldo || IMAGEN_POR_DEFECTO;
    }
  }
}