import { Injectable, computed, signal } from '@angular/core';
import { RespuestaSesion, Usuario } from '../models/usuario';

@Injectable({ providedIn: 'root' })
export class Sesion {
  readonly usuario = signal<Usuario | null>(null);
  readonly venceEn = signal<number | null>(null); // momento de vencimiento, en milisegundos
  readonly logueado = computed(() => this.usuario() !== null);
  readonly esAdmin = computed(() => this.usuario()?.perfil === 'administrador');

  iniciar(respuesta: RespuestaSesion) {
    this.usuario.set(respuesta.usuario);
    this.venceEn.set(Date.now() + respuesta.expiraEnSegundos * 1000);
  }

  cerrar() {
    this.usuario.set(null);
    this.venceEn.set(null);
  }
}