import { Directive, TemplateRef, ViewContainerRef, effect, inject } from '@angular/core';
import { Sesion } from '../servicios/sesion';

@Directive({ selector: '[appSiEsAdmin]' })
export class SiEsAdmin {
  private plantilla = inject(TemplateRef);
  private contenedor = inject(ViewContainerRef);
  private sesion = inject(Sesion);
  private mostrando = false;

  constructor() {
    // Se vuelve a ejecutar sola cuando cambia la sesión (login, logout, cambio de usuario)
    effect(() => {
      const esAdmin = this.sesion.esAdmin();
      if (esAdmin && !this.mostrando) {
        this.contenedor.createEmbeddedView(this.plantilla);
        this.mostrando = true;
      } else if (!esAdmin && this.mostrando) {
        this.contenedor.clear();
        this.mostrando = false;
      }
    });
  }
}