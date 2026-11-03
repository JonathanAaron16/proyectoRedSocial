import { Component, computed, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Sesion } from '../../servicios/sesion';

@Component({
  selector: 'app-mi-perfil',
  imports: [DatePipe, RouterLink],
  templateUrl: './mi-perfil.html',
  styleUrl: './mi-perfil.css',
})
export class MiPerfil {
  sesion = inject(Sesion);

  // Por si un usuario viejo no tiene foto: mostramos sus iniciales
  iniciales = computed(() => {
    const u = this.sesion.usuario();
    return u ? (u.nombre[0] + u.apellido[0]).toUpperCase() : '';
  });
}