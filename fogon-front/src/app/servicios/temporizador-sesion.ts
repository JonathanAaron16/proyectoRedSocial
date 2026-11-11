import { Injectable, effect, inject, untracked } from '@angular/core';
import { Auth } from './auth';
import { Sesion } from './sesion';
import { Modal } from './modal';

const AVISO_MS =  20 * 1000; // 10 minutos (el token vence a los 15)

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
      const usuario = this.sesion.usuario();
      untracked(() => (usuario ? this.reiniciar() : this.detener()));
    });
  }

  private reiniciar() {
    this.detener();
    this.temporizador = setTimeout(() => this.avisar(), AVISO_MS);
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
      const usuario = await this.auth.refrescar();
      this.sesion.iniciar(usuario); // esto reinicia el contador gracias al effect
    } catch {
      // Si el token ya venció, el interceptor manda al login
    }
  }
}