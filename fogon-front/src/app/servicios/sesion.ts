import { Injectable, computed, signal } from '@angular/core';
import { Usuario } from '../models/usuario';

@Injectable({ providedIn: 'root' })
export class Sesion {
  readonly usuario = signal<Usuario | null>(null);
  readonly logueado = computed(() => this.usuario() !== null);
  readonly esAdmin = computed(() => this.usuario()?.perfil === 'administrador');

  iniciar(usuario: Usuario) {
    this.usuario.set(usuario);
  }

  cerrar() {
    this.usuario.set(null);
  }
}