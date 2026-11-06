import { Component, computed, inject, input, linkedSignal, output, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Publicacion } from '../../models/publicacion';
import { Publicaciones } from '../../servicios/publicaciones';
import { Sesion } from '../../servicios/sesion';
import { Modal } from '../../servicios/modal';
import { mensajeDeError } from '../../utils/mensaje-error';

@Component({
  selector: 'app-tarjeta-publicacion',
  imports: [DatePipe],
  templateUrl: './tarjeta-publicacion.html',
  styleUrl: './tarjeta-publicacion.css',
})
export class TarjetaPublicacion {
  private publicacionesService = inject(Publicaciones);
  private sesion = inject(Sesion);
  private modal = inject(Modal);

  publicacion = input.required<Publicacion>();
  eliminada = output<string>();

  // Arrancan con lo que vino del back y se actualizan al dar o quitar me gusta
  meGusta = linkedSignal(() => this.publicacion().meGusta);
  cantidadLikes = linkedSignal(() => this.publicacion().cantidadLikes);
  enviandoLike = signal(false);

  puedeEliminar = computed(() => {
    const usuario = this.sesion.usuario();
    return !!usuario && (usuario._id === this.publicacion().autor._id || usuario.perfil === 'administrador');
  });

  iniciales = computed(() => {
    const autor = this.publicacion().autor;
    return (autor.nombre[0] + autor.apellido[0]).toUpperCase();
  });

  async alternarMeGusta() {
    if (this.enviandoLike()) return;
    this.enviandoLike.set(true);
    const id = this.publicacion()._id;
    try {
      const estado = this.meGusta()
        ? await this.publicacionesService.quitarMeGusta(id)
        : await this.publicacionesService.darMeGusta(id);
      this.meGusta.set(estado.meGusta);
      this.cantidadLikes.set(estado.cantidadLikes);
    } catch (error) {
      this.modal.error('No pudimos actualizar la leña', mensajeDeError(error));
    } finally {
      this.enviandoLike.set(false);
    }
  }

  async eliminar() {
    const confirmado = await this.modal.confirmar(
      '¿Eliminar publicación?',
      'Va a dejar de verse en el fogón. No se puede deshacer.',
      'Eliminar',
    );
    if (!confirmado) return;

    try {
      await this.publicacionesService.eliminar(this.publicacion()._id);
      this.eliminada.emit(this.publicacion()._id);
    } catch (error) {
      this.modal.error('No pudimos eliminar la publicación', mensajeDeError(error));
    }
  }
}