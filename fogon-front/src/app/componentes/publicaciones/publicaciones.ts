import { Component, inject } from '@angular/core';
import { Sesion } from '../../servicios/sesion';

@Component({
  imports: [],
  selector: 'app-publicaciones',
  styleUrl: './publicaciones.css',
  templateUrl: './publicaciones.html',
})
export class Publicaciones {
  sesion = inject(Sesion);
}
