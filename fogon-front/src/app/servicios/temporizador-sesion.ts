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

    private contadorPrueba: ReturnType<typeof setInterval> | null = null; // PRUEBA

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

    // PRUEBA: muestra el tiempo restante en la consola
    console.log(`[Sesión] Iniciada. Vence a las ${new Date(venceEn).toLocaleTimeString()}`);
    this.mostrarRestante(venceEn);
    this.contadorPrueba = setInterval(() => this.mostrarRestante(venceEn), 10_000);
  }

  private detener() {
    if (this.temporizador) clearTimeout(this.temporizador);
    this.temporizador = null;

    // PRUEBA
    if (this.contadorPrueba) clearInterval(this.contadorPrueba);
    this.contadorPrueba = null;
  }
   private mostrarRestante(venceEn: number) {
    const formato = (ms: number) => {
      const segundos = Math.max(0, Math.round(ms / 1000));
      return `${Math.floor(segundos / 60)}:${String(segundos % 60).padStart(2, '0')}`;
    };
    const paraVencer = venceEn - Date.now();
    const paraAviso = paraVencer - MARGEN_AVISO_MS;
    console.log(
      `[Sesión] Vence en ${formato(paraVencer)} · Aviso en ${paraAviso > 0 ? formato(paraAviso) : 'ya'}`,
    );
  }

  private async avisar() {
    const restanteMs = (this.sesion.venceEn() ?? 0) - Date.now();
    if (restanteMs <= 0) return; // ya venció: la próxima petición lleva al login

    const minutos = Math.round(restanteMs / 60_000);
    const titulo =
      minutos < 1
        ? 'Te queda menos de un minuto de sesión'
        : `Te ${minutos === 1 ? 'queda 1 minuto' : `quedan ${minutos} minutos`} de sesión`;

    const extender = await this.modal.confirmar(
      titulo,
      '¿Querés extenderla? Si no, vas a tener que volver a ingresar.',
      'Extender sesión',
    );
    if (!extender) return;

    try {
      const respuesta  = await this.auth.refrescar();
      console.log(`[Sesión] Extendida: ${respuesta.expiraEnSegundos} segundos más`); // PRUEBA
      this.sesion.iniciar(respuesta); // esto reinicia el contador gracias al effect
    } catch {
      // Si el token ya venció, el interceptor manda al login
    }
  }
}