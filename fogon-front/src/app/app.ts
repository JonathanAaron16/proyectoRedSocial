import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Dialogo } from './componentes/dialogo/dialogo';
import { TemporizadorSesion } from './servicios/temporizador-sesion';

@Component({
  imports: [RouterOutlet,Dialogo],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('fogon-front');
  // Se crea al arrancar la app y queda vigilando la sesión todo el tiempo
  private temporizador = inject(TemporizadorSesion);
}
