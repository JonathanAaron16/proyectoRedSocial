import { Component, ElementRef, OnDestroy, inject, output, signal, viewChild } from '@angular/core';
import { form, FormField, required, maxLength } from '@angular/forms/signals';
import { ErroresCampo } from '../errores-campo/errores-campo';
import { Publicaciones } from '../../servicios/publicaciones';
import { Modal } from '../../servicios/modal';
import { mensajeDeError } from '../../utils/mensaje-error';
import { validarImagen } from '../../utils/validar-imagen';

@Component({
  selector: 'app-nueva-publicacion',
  imports: [FormField, ErroresCampo],
  templateUrl: './nueva-publicacion.html',
  styleUrl: './nueva-publicacion.css',
})
export class NuevaPublicacion implements OnDestroy {
  private publicacionesService = inject(Publicaciones);
  private modal = inject(Modal);

  creada = output<void>();
// Variables para manejar el formulario y la imagen. 
// viewChild da acceso a elementos del template marcados con #nombre: el campo del título (para enfocarlo) y el input de la imagen (para vaciarlo)
  private campoTitulo = viewChild<ElementRef<HTMLInputElement>>('campoTitulo');
  private inputImagen = viewChild<ElementRef<HTMLInputElement>>('inputImagen');

  abierto = signal(false);
  enviando = signal(false);

  modelo = signal({ titulo: '', mensaje: '' });

  publicacionForm = form(this.modelo, (s) => {
    required(s.titulo, { message: 'El título es obligatorio' });
    maxLength(s.titulo, 100, { message: 'Máximo 100 caracteres' });
    required(s.mensaje, { message: 'Contá algo en el mensaje' });
    maxLength(s.mensaje, 2000, { message: 'Máximo 2000 caracteres' });
  });
  // Variables para la imagen
  imagen = signal<File | null>(null);
  vistaPrevia = signal<string | null>(null);
  errorImagen = signal<string | null>(null);

  abrir() {
    this.abierto.set(true);
    // Espera a que se dibuje el formulario y pone el cursor en el título
    setTimeout(() => this.campoTitulo()?.nativeElement.focus());
  }

  cancelar() {
    this.reiniciar();
  }
  // Manejo de la imagen
  elegirImagen(event: Event) {
    const input = event.target as HTMLInputElement;
    const archivo = input.files?.[0] ?? null;
    this.limpiarImagen();
    if (!archivo) return;

    const error = validarImagen(archivo);
    if (error) {
      this.errorImagen.set(error);
      input.value = '';
      return;
    }
    this.imagen.set(archivo);
    this.vistaPrevia.set(URL.createObjectURL(archivo));
  }
  // Quita la imagen y limpia la vista previa
  quitarImagen() {
    const input = this.inputImagen()?.nativeElement;
    if (input) input.value = '';
    this.limpiarImagen();
  }
// Publica la historia
  async publicar(event: Event) {
    event.preventDefault();
    if (this.publicacionForm().invalid() || this.errorImagen()) {
      this.publicacionForm().markAsTouched();
      return;
    }

    const datos = new FormData();
    datos.append('titulo', this.modelo().titulo);
    datos.append('mensaje', this.modelo().mensaje);
    const imagen = this.imagen();
    if (imagen) datos.append('imagen', imagen);

    this.enviando.set(true);
    try {
      await this.publicacionesService.crear(datos);
      this.reiniciar();
      this.creada.emit();
    } catch (error) {
      this.modal.error('No pudimos publicar tu historia', mensajeDeError(error));
    } finally {
      this.enviando.set(false);
    }
  }

  ngOnDestroy() {
    this.limpiarImagen();
  }
// Reinicia el formulario y limpia la imagen
  private reiniciar() {
    this.modelo.set({ titulo: '', mensaje: '' });
    this.publicacionForm().reset();
    this.quitarImagen();
    this.abierto.set(false);
  }
// Limpia la imagen y la vista previa
  private limpiarImagen() {
    const url = this.vistaPrevia();
    if (url) URL.revokeObjectURL(url);
    this.vistaPrevia.set(null);
    this.imagen.set(null);
    this.errorImagen.set(null);
  }
}