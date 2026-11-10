import { Component, computed, inject, signal } from '@angular/core';
import { TarjetaPublicacion } from '../tarjeta-publicacion/tarjeta-publicacion';
import { Publicaciones as PublicacionesService } from '../../servicios/publicaciones';
import { OrdenPublicaciones, Publicacion } from '../../models/publicacion';
import { mensajeDeError } from '../../utils/mensaje-error';
import { NuevaPublicacion } from '../nueva-publicacion/nueva-publicacion';

const POR_PAGINA = 5;

@Component({
  selector: 'app-publicaciones',
  imports: [TarjetaPublicacion, NuevaPublicacion],
  templateUrl: './publicaciones.html',
  styleUrl: './publicaciones.css',
})
export class Publicaciones {
  private publicacionesService = inject(PublicacionesService);

  publicaciones = signal<Publicacion[]>([]);
  total = signal(0);
  orden = signal<OrdenPublicaciones>('fecha');
  pagina = signal(1);
  cargando = signal(true);
  error = signal<string | null>(null);

  totalPaginas = computed(() => Math.max(1, Math.ceil(this.total() / POR_PAGINA)));

  private ultimoPedido = 0;

  constructor() {
    this.cargar();
  }

  async cargar() {
    const pedido = ++this.ultimoPedido;
    this.cargando.set(true);
    this.error.set(null);
    try {
      const resultado = await this.publicacionesService.listar({
        orden: this.orden(),
        offset: (this.pagina() - 1) * POR_PAGINA,
        limit: POR_PAGINA,
      });
      if (pedido !== this.ultimoPedido) return; // llegó tarde: ya se pidió otra página
      this.publicaciones.set(resultado.publicaciones);
      this.total.set(resultado.total);
    } catch (error) {
      if (pedido === this.ultimoPedido) this.error.set(mensajeDeError(error));
    } finally {
      if (pedido === this.ultimoPedido) this.cargando.set(false);
    }
  }

  cambiarOrden(orden: OrdenPublicaciones) {
    if (orden === this.orden()) return;
    this.orden.set(orden);
    this.pagina.set(1);
    this.cargar();
  }

  irAPagina(pagina: number) {
    if (pagina < 1 || pagina > this.totalPaginas()) return;
    this.pagina.set(pagina);
    this.cargar();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  alEliminar() {
    // Si era la única de la última página, volvemos a la anterior
    if (this.publicaciones().length === 1 && this.pagina() > 1) {
      this.pagina.update((p) => p - 1);
    }
    
    this.cargar();
  }

  alCrear() {
       // La nueva publicación es la más reciente: la mostramos arriba de todo
       this.orden.set('fecha');
       this.pagina.set(1);
       this.cargar();
     }
}