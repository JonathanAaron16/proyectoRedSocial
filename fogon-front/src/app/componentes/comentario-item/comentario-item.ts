import { Component, computed, inject, input, output, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Comentario } from '../../models/comentario';
import { Comentarios } from '../../servicios/comentarios';
import { Sesion } from '../../servicios/sesion';
import { Modal } from '../../servicios/modal';
import { mensajeDeError } from '../../utils/mensaje-error';

@Component({
  selector: 'app-comentario-item',
  imports: [DatePipe],
  templateUrl: './comentario-item.html',
  styleUrl: './comentario-item.css',
})
export class ComentarioItem {
  private comentariosService = inject(Comentarios);
  private sesion = inject(Sesion);
  private modal = inject(Modal);

  comentario = input.required<Comentario>();
  editado = output<Comentario>();

  editando = signal(false);
  texto = signal('');
  guardando = signal(false);

  puedeEditar = computed(() => this.comentario().autor._id === this.sesion.usuario()?._id);

  iniciales = computed(() => {
    const autor = this.comentario().autor;
    return (autor.nombre[0] + autor.apellido[0]).toUpperCase();
  });

  errorTexto = computed(() => {
    const texto = this.texto().trim();
    if (!texto) return 'El comentario no puede estar vacío';
    if (texto.length > 500) return 'Máximo 500 caracteres';
    return null;
  });

  empezarEdicion() {
    this.texto.set(this.comentario().mensaje);
    this.editando.set(true);
  }

  cancelar() {
    this.editando.set(false);
  }

  async guardar() {
    if (this.errorTexto() || this.guardando()) return;

    const texto = this.texto().trim();
    if (texto === this.comentario().mensaje) {
      this.editando.set(false); // no cambió nada: no hace falta llamar al back
      return;
    }

    this.guardando.set(true);
    try {
      const actualizado = await this.comentariosService.editar(
        this.comentario().publicacion,
        this.comentario()._id,
        texto,
      );
      this.editado.emit(actualizado);
      this.editando.set(false);
    } catch (error) {
      this.modal.error('No pudimos editar el comentario', mensajeDeError(error));
    } finally {
      this.guardando.set(false);
    }
  }
}