import { Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ChartConfiguration } from 'chart.js';
import { Grafico } from '../grafico/grafico';
import { Estadisticas } from '../../servicios/estadisticas';
import {
  ComentariosEnRango, ComentariosPorPublicacion, PublicacionesPorUsuario, RangoFechas,
} from '../../models/estadisticas';
import { aFecha, aIso, diasEntre, fechaCorta, fechaLarga, sumarDias } from '../../utils/fechas';
import { mensajeDeError } from '../../utils/mensaje-error';

const BRASA = '#F2711C';
const PALETA = ['#F2711C', '#E3A33B', '#4F9D69', '#3E86C6', '#9B6BC9', '#C9506B', '#7A8B99', '#B8864E'];
const ATAJOS = [7, 30, 90];

const recortar = (texto: string, max: number) => (texto.length > max ? texto.slice(0, max - 1) + '…' : texto);

@Component({
  selector: 'app-dashboard-estadisticas',
  imports: [DecimalPipe, Grafico],
  templateUrl: './dashboard-estadisticas.html',
  styleUrl: './dashboard-estadisticas.css',
})
export class DashboardEstadisticas {
  private estadisticas = inject(Estadisticas);

  readonly hoy = aIso(new Date());
  readonly atajos = ATAJOS;

  // Lo que el usuario está eligiendo en los inputs
  desde = signal(aIso(sumarDias(new Date(), -29)));
  hasta = signal(this.hoy);

  // El rango de los datos que se están mostrando (cambia solo cuando la consulta sale bien)
  rango = signal<RangoFechas>({ desde: this.desde(), hasta: this.hasta() });

  cargando = signal(false);
  listo = signal(false);
  error = signal<string | null>(null);

  porUsuario = signal<PublicacionesPorUsuario[]>([]);
  comentarios = signal<ComentariosEnRango>({ total: 0, porDia: [] });
  porPublicacion = signal<ComentariosPorPublicacion[]>([]);

  // Las fechas 'YYYY-MM-DD' se pueden comparar como texto: el orden alfabético coincide con el cronológico
  errorRango = computed(() => {
    const desde = this.desde();
    const hasta = this.hasta();
    if (!desde || !hasta) return 'Elegí las dos fechas';
    if (desde > hasta) return 'La fecha "desde" no puede ser posterior a "hasta"';
    if (hasta > this.hoy) return 'La fecha "hasta" no puede ser futura';
    if (diasEntre(desde, hasta) + 1 > 366) return 'El rango máximo es de un año';
    return null;
  });

  cantidadDias = computed(() => diasEntre(this.rango().desde, this.rango().hasta) + 1);
  textoRango = computed(() => `Del ${fechaLarga(this.rango().desde)} al ${fechaLarga(this.rango().hasta)}`);

  atajoActivo = computed(() =>
    this.rango().hasta === this.hoy ? (ATAJOS.find((d) => d === this.cantidadDias()) ?? null) : null,
  );

  totalPublicaciones = computed(() => this.porUsuario().reduce((suma, u) => suma + u.cantidad, 0));
  promedioDiario = computed(() => this.comentarios().total / this.cantidadDias());

  // El back solo devuelve los días que tuvieron comentarios: se completan los demás con 0
  comentariosPorDia = computed(() => {
    const cantidades = new Map(this.comentarios().porDia.map((d) => [d.fecha, d.cantidad]));
    const { desde, hasta } = this.rango();
    const dias: { fecha: string; cantidad: number }[] = [];
    for (let fecha = desde; fecha <= hasta; fecha = aIso(sumarDias(aFecha(fecha), 1))) {
      dias.push({ fecha, cantidad: cantidades.get(fecha) ?? 0 });
    }
    return dias;
  });

  diasConComentarios = computed(() => this.comentariosPorDia().filter((d) => d.cantidad > 0));

  // Las barras crecen con la cantidad de usuarios para que no queden aplastadas
  altoBarras = computed(() => Math.max(220, this.porUsuario().length * 40 + 40));

  fechaCorta = fechaCorta;

  configComentarios = computed<ChartConfiguration>(() => ({
    type: 'line',
    data: {
      labels: this.comentariosPorDia().map((d) => fechaCorta(d.fecha)),
      datasets: [{
        label: 'Comentarios',
        data: this.comentariosPorDia().map((d) => d.cantidad),
        borderColor: BRASA,
        backgroundColor: 'rgba(242, 113, 28, 0.15)',
        fill: true,
        tension: 0.3,
        pointRadius: this.cantidadDias() > 45 ? 0 : 3,
        pointHoverRadius: 5,
      }],
    },
    options: {
      interaction: { mode: 'index', intersect: false },
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, ticks: { precision: 0 } },
        x: { grid: { display: false }, ticks: { maxTicksLimit: 10 } },
      },
    },
  }));

  configUsuarios = computed<ChartConfiguration>(() => ({
    type: 'bar',
    data: {
      labels: this.porUsuario().map((u) => '@' + u.nombreUsuario),
      datasets: [{
        label: 'Publicaciones',
        data: this.porUsuario().map((u) => u.cantidad),
        backgroundColor: BRASA,
        borderRadius: 6,
        maxBarThickness: 28,
      }],
    },
    options: {
      indexAxis: 'y',
      plugins: { legend: { display: false } },
      scales: {
        x: { beginAtZero: true, ticks: { precision: 0 } },
        y: { grid: { display: false } },
      },
    },
  }));

  configPublicaciones = computed<ChartConfiguration>(() => ({
    type: 'doughnut',
    data: {
      labels: this.porPublicacion().map((p) => recortar(p.titulo, 28)),
      datasets: [{
        label: 'Comentarios',
        data: this.porPublicacion().map((p) => p.cantidad),
        backgroundColor: PALETA,
        borderWidth: 2,
      }],
    },
    options: {
      cutout: '60%',
      plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, padding: 14 } } },
    },
  }));

  constructor() {
    this.consultar();
  }

  aplicar(event: Event) {
    event.preventDefault();
    this.consultar();
  }

  usarAtajo(dias: number) {
    this.hasta.set(this.hoy);
    this.desde.set(aIso(sumarDias(new Date(), -(dias - 1))));
    this.consultar();
  }

  async consultar() {
    if (this.errorRango()) return;
    const rango = { desde: this.desde(), hasta: this.hasta() };

    this.cargando.set(true);
    this.error.set(null);
    try {
      const [porUsuario, comentarios, porPublicacion] = await Promise.all([
        this.estadisticas.publicacionesPorUsuario(rango),
        this.estadisticas.comentarios(rango),
        this.estadisticas.comentariosPorPublicacion(rango),
      ]);
      this.porUsuario.set(porUsuario);
      this.comentarios.set(comentarios);
      this.porPublicacion.set(porPublicacion);
      this.rango.set(rango);
      this.listo.set(true);
    } catch (error) {
      this.error.set(mensajeDeError(error));
    } finally {
      this.cargando.set(false);
    }
  }
}