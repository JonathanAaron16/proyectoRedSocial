import { Component, ElementRef, OnDestroy, afterRenderEffect, inject, input, viewChild } from '@angular/core';
import {
  ArcElement, BarController, BarElement, CategoryScale, Chart, ChartConfiguration, DoughnutController,
  Filler, Legend, LineController, LineElement, LinearScale, PointElement, Tooltip,
} from 'chart.js';
import { Tema } from '../../servicios/tema';

// Se registran solo las piezas que usamos: el resto de Chart.js no entra en el bundle
Chart.register(
  BarController, BarElement, LineController, LineElement, PointElement,
  DoughnutController, ArcElement, CategoryScale, LinearScale, Filler, Tooltip, Legend,
);

@Component({
  selector: 'app-grafico',
  template: `<canvas #lienzo role="img" [attr.aria-label]="descripcion()"></canvas>`,
  styles: `:host { display: block; position: relative; height: var(--alto-grafico, 300px); }`,
})
export class Grafico implements OnDestroy {
  config = input.required<ChartConfiguration>();
  descripcion = input.required<string>();

  private lienzo = viewChild.required<ElementRef<HTMLCanvasElement>>('lienzo');
  private tema = inject(Tema);
  private grafico?: Chart;

  constructor() {
    // Se ejecuta después de que Angular actualiza el DOM, cada vez que cambian los datos o el tema
    afterRenderEffect(() => {
      const config = this.config();
      this.tema.alternar(); // ← usá la señal de tu servicio Tema; solo se lee para redibujar al cambiar de tema

      this.aplicarColoresDelTema();
      this.grafico?.destroy();
      this.grafico = new Chart(this.lienzo().nativeElement, {
        ...config,
        options: { responsive: true, maintainAspectRatio: false, ...config.options },
      });
    });
  }

  ngOnDestroy() {
    this.grafico?.destroy();
  }

  // Chart.js dibuja en un <canvas>, que no entiende variables CSS: se leen y se le pasan los valores
  private aplicarColoresDelTema() {
    const raiz = getComputedStyle(document.documentElement);
    const variable = (nombre: string) => raiz.getPropertyValue(nombre).trim();

    Chart.defaults.color = variable('--color-texto-tenue');
    Chart.defaults.borderColor = variable('--color-borde');
    Chart.defaults.font.family = getComputedStyle(document.body).fontFamily;
    Chart.defaults.font.size = 13;
    Chart.defaults.elements.arc.borderColor = variable('--color-tarjeta');
    Chart.defaults.plugins.tooltip.padding = 10;
    Chart.defaults.plugins.tooltip.cornerRadius = 8;

    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      Chart.defaults.animation = false;
    }
  }
}