import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Sesion } from '../../servicios/sesion';
import { Publicaciones } from '../../servicios/publicaciones';
import { Publicacion } from '../../models/publicacion';
import { TarjetaPublicacion } from '../tarjeta-publicacion/tarjeta-publicacion';
import { mensajeDeError } from '../../utils/mensaje-error';

@Component({
  selector: 'app-mi-perfil',
  imports: [DatePipe, RouterLink, TarjetaPublicacion],
  templateUrl: './mi-perfil.html',
  styleUrl: './mi-perfil.css',
})
export class MiPerfil {
  sesion = inject(Sesion);
  private publicacionesService = inject(Publicaciones);

  ultimas = signal<Publicacion[]>([]);
  totalPublicaciones = signal(0);
  cargandoPublicaciones = signal(true);
  errorPublicaciones = signal<string | null>(null);

  iniciales = computed(() => {
    const u = this.sesion.usuario();
    return u ? (u.nombre[0] + u.apellido[0]).toUpperCase() : '';
  });

  constructor() {
    this.cargarUltimas();
  }

  async cargarUltimas() {
    const id = this.sesion.usuario()?._id;
    if (!id) return;

    this.cargandoPublicaciones.set(true);
    this.errorPublicaciones.set(null);
    try {
      const resultado = await this.publicacionesService.listar({ usuario: id, limit: 3 });
      this.ultimas.set(resultado.publicaciones);
      this.totalPublicaciones.set(resultado.total);
    } catch (error) {
      this.errorPublicaciones.set(mensajeDeError(error));
    } finally {
      this.cargandoPublicaciones.set(false);
    }
  }
}