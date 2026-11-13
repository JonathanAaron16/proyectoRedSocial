import { Injectable, effect, inject, untracked } from '@angular/core';
import { Auth } from './auth';
import { Sesion } from './sesion';
import { Modal } from './modal';

const MARGEN_AVISO_MS = 5 * 60 * 1000; // avisar 5 minutos antes de que venza

@Injectable({ providedIn: 'root' })
export class TemporizadorSesion {
  private auth = inject(Auth);
  private sesion = inject(Sesion);
  private modal = inject(Modal);

  private temporizador: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    // Cada vez que se inicia (o renueva) la sesión, arranca el contador de cero.
    // Al cerrar sesión, se detiene.
     effect(() => {
      const venceEn = this.sesion.venceEn();
      untracked(() => (venceEn ? this.reiniciar(venceEn) : this.detener()));
    });
  }

  private reiniciar(venceEn: number) {
    this.detener();
    const espera = venceEn - MARGEN_AVISO_MS - Date.now();
    this.temporizador = setTimeout(() => this.avisar(), Math.max(espera, 0));
  }

  private detener() {
    if (this.temporizador) clearTimeout(this.temporizador);
    this.temporizador = null;
  }

  private async avisar() {
    const extender = await this.modal.confirmar(
      'Te quedan 5 minutos de sesión',
      '¿Querés extenderla? Si no, vas a tener que volver a ingresar.',
      'Extender sesión',
    );
    if (!extender) return;

    try {
      const respuesta  = await this.auth.refrescar();
      this.sesion.iniciar(respuesta); // esto reinicia el contador gracias al effect
    } catch {
      // Si el token ya venció, el interceptor manda al login
    }
  }
}