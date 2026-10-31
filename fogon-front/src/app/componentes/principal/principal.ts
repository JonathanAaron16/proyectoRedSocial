import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Tema } from '../../servicios/tema';
import { Auth } from '../../servicios/auth';
import { Sesion } from '../../servicios/sesion';
import { Modal } from '../../servicios/modal';

@Component({
  selector: 'app-principal',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './principal.html',
  styleUrl: './principal.css',
})
export class Principal {
  tema = inject(Tema);
  private auth = inject(Auth);
  private sesion = inject(Sesion);
  private modal = inject(Modal);
  private router = inject(Router);

  async salir() {
    const confirmado = await this.modal.confirmar(
      '¿Salir del fogón?',
      'Vas a tener que volver a ingresar para ver las publicaciones.',
      'Salir',
    );
    if (!confirmado) return;

    try {
      await this.auth.cerrarSesion();
    } catch {
      // Si el back no responde, igual cerramos la sesión de este lado
    }
    this.sesion.cerrar();
    this.router.navigate(['/login']);
  }
}