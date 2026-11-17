import { Directive, ElementRef, afterEveryRender, inject, input } from '@angular/core';

@Directive({
  selector: 'textarea[appAutoAltura]',
  host: { '(input)': 'ajustar()' },
})
export class AutoAltura {
  alturaMaxima = input(400);

  private textarea = inject<ElementRef<HTMLTextAreaElement>>(ElementRef).nativeElement;
  private ultimoValor: string | null = null;

  constructor() {
    this.textarea.style.resize = 'none';
    // Cubre los cambios que no vienen del teclado: el formulario se vacía al publicar,
    // o el textarea aparece con texto al editar un comentario
    afterEveryRender(() => {
      if (this.textarea.value !== this.ultimoValor) this.ajustar();
    });
  }

  ajustar() {
    const t = this.textarea;
    this.ultimoValor = t.value;

    t.style.height = 'auto'; // primero vuelve a su tamaño base (rows), para que también se achique al borrar
    const bordes = t.offsetHeight - t.clientHeight;
    const necesaria = t.scrollHeight + bordes;
    const maxima = this.alturaMaxima();

    t.style.height = `${Math.min(necesaria, maxima)}px`;
    t.style.overflowY = necesaria > maxima ? 'auto' : 'hidden';
  }
}