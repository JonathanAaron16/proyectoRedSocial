import { Injectable, signal } from '@angular/core';

export type TipoModal = 'info' | 'exito' | 'error' | 'confirmar';

interface ModalAbierto {
  tipo: TipoModal;
  titulo: string;
  mensaje: string;
  textoAceptar: string;
  textoCancelar?: string;
  resolver: (aceptado: boolean) => void;
}

@Injectable({ providedIn: 'root' })
export class Modal {
  readonly actual = signal<ModalAbierto | null>(null);

  mostrar(tipo: TipoModal, titulo: string, mensaje: string, textoAceptar = 'Entendido', textoCancelar?: string) {
    return new Promise<boolean>(resolver => {
      this.actual.set({ tipo, titulo, mensaje, textoAceptar, textoCancelar, resolver });
    });
  }

  error(titulo: string, mensaje: string) {
    return this.mostrar('error', titulo, mensaje);
  }

  exito(titulo: string, mensaje: string) {
    return this.mostrar('exito', titulo, mensaje);
  }

  confirmar(titulo: string, mensaje: string, textoAceptar = 'Confirmar') {
    return this.mostrar('confirmar', titulo, mensaje, textoAceptar, 'Cancelar');
  }

  responder(aceptado: boolean) {
    const modal = this.actual();
    this.actual.set(null);
    modal?.resolver(aceptado);
  }
}