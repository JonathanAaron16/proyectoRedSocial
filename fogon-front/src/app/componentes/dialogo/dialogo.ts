import { Component, ElementRef, effect, inject, viewChild } from '@angular/core';
import { Modal } from '../../servicios/modal';

@Component({
  selector: 'app-dialogo',
  templateUrl: './dialogo.html',
  styleUrl: './dialogo.css',
})
export class Dialogo {
  modal = inject(Modal);
  private dialogo = viewChild.required<ElementRef<HTMLDialogElement>>('dialogo');

  constructor() {
    // Abre o cierra el <dialog> según haya un modal activo
    effect(() => {
      const el = this.dialogo().nativeElement;
      if (this.modal.actual()) {
        if (!el.open) el.showModal();
      } else if (el.open) {
        el.close();
      }
    });
  }

  alPresionarEscape(event: Event) {
    event.preventDefault();
    this.modal.responder(false);
  }
}