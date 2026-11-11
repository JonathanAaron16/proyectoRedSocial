import { Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { TarjetaPublicacion } from '../tarjeta-publicacion/tarjeta-publicacion';
import { ComentarioItem } from '../comentario-item/comentario-item';
import { Publicaciones } from '../../servicios/publicaciones';
import { Comentarios } from '../../servicios/comentarios';
import { Modal } from '../../servicios/modal';
import { Publicacion } from '../../models/publicacion';
import { Comentario } from '../../models/comentario';
import { mensajeDeError } from '../../utils/mensaje-error';

const POR_CARGA = 5;

@Component({
  selector: 'app-detalle-publicacion',
  imports: [RouterLink, TarjetaPublicacion, ComentarioItem],
  templateUrl: './detalle-publicacion.html',
  styleUrl: './detalle-publicacion.css',
})
export class DetallePublicacion {
  private publicacionesService = inject(Publicaciones);
  private comentariosService = inject(Comentarios);
  private modal = inject(Modal);
  private router = inject(Router);

  id = input.required<string>(); // viene de la URL: /publicaciones/:id

  publicacion = signal<Publicacion | null>(null);
  cargando = signal(true);
  error = signal<string | null>(null);

  comentarios = signal<Comentario[]>([]);
  totalComentarios = signal(0);
  cargandoMas = signal(false);
  hayMas = computed(() => this.comentarios().length < this.totalComentarios());

  nuevoComentario = signal('');
  enviando = signal(false);
  intentoEnviar = signal(false);
  errorNuevo = computed(() => {
    const texto = this.nuevoComentario().trim();
    if (!texto) return 'Escribí algo para comentar';
    if (texto.length > 500) return 'Máximo 500 caracteres';
    return null;
  });

  constructor() {
    // Cada vez que cambia el id de la URL, carga esa publicación
    effect(() => {
      const id = this.id();
      untracked(() => this.cargar(id));
    });
  }

  async cargar(id: string) {
    this.cargando.set(true);
    this.error.set(null);
    try {
      const [publicacion, pagina] = await Promise.all([
        this.publicacionesService.obtener(id),
        this.comentariosService.listar(id, 0, POR_CARGA),
      ]);
      this.publicacion.set(publicacion);
      this.comentarios.set(pagina.comentarios);
      this.totalComentarios.set(pagina.total);
    } catch (error) {
      const noExiste = error instanceof HttpErrorResponse && error.status === 404;
      this.error.set(noExiste ? 'Esta historia ya no está en el fogón.' : mensajeDeError(error));
    } finally {
      this.cargando.set(false);
    }
  }

  async cargarMas() {
    if (this.cargandoMas()) return;
    this.cargandoMas.set(true);
    try {
      const pagina = await this.comentariosService.listar(this.id(), this.comentarios().length, POR_CARGA);
      const yaEstan = new Set(this.comentarios().map((c) => c._id));
      this.comentarios.update((lista) => [...lista, ...pagina.comentarios.filter((c) => !yaEstan.has(c._id))]);
      this.totalComentarios.set(pagina.total);
    } catch (error) {
      this.modal.error('No pudimos traer más comentarios', mensajeDeError(error));
    } finally {
      this.cargandoMas.set(false);
    }
  }

  async comentar(event: Event) {
    event.preventDefault();
    this.intentoEnviar.set(true);
    if (this.errorNuevo() || this.enviando()) return;

    this.enviando.set(true);
    try {
      const comentario = await this.comentariosService.crear(this.id(), this.nuevoComentario().trim());
      this.comentarios.update((lista) => [comentario, ...lista]);
      this.totalComentarios.update((total) => total + 1);
      this.nuevoComentario.set('');
      this.intentoEnviar.set(false);
    } catch (error) {
      this.modal.error('No pudimos publicar tu comentario', mensajeDeError(error));
    } finally {
      this.enviando.set(false);
    }
  }

  alEditar(actualizado: Comentario) {
    this.comentarios.update((lista) => lista.map((c) => (c._id === actualizado._id ? actualizado : c)));
  }

  alEliminar() {
    this.router.navigate(['/publicaciones']);
  }
}