import { Injectable, effect, signal } from '@angular/core';

export type ModoTema = 'noche' | 'claro';
const CLAVE = 'fogon-tema';

@Injectable({ providedIn: 'root' })
export class Tema {
  readonly modo = signal<ModoTema>(this.leerGuardado());

  constructor() {
    // Cada vez que cambia "modo", se aplica al <html> y se guarda
    effect(() => {
      const modo = this.modo();
      if (modo === 'claro') {
        document.documentElement.setAttribute('data-tema', 'claro');
      } else {
        document.documentElement.removeAttribute('data-tema');
      }
      try { localStorage.setItem(CLAVE, modo); } catch {}
    });
  }

  alternar() {
    this.modo.update(m => (m === 'noche' ? 'claro' : 'noche'));
  }

  private leerGuardado(): ModoTema {
    try {
      return localStorage.getItem(CLAVE) === 'claro' ? 'claro' : 'noche';
    } catch {
      return 'noche';
    }
  }
}