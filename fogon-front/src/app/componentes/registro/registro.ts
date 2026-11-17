import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormularioUsuario } from '../formulario-usuario/formulario-usuario';
import { Auth } from '../../servicios/auth';
import { Sesion } from '../../servicios/sesion';
import { Modal } from '../../servicios/modal';
import { mensajeDeError } from '../../utils/mensaje-error';

@Component({
  selector: 'app-registro',
  imports: [RouterLink, FormularioUsuario],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class Registro {
  private auth = inject(Auth);
  private sesion = inject(Sesion);
  private modal = inject(Modal);
  private router = inject(Router);

  enviando = signal(false);

  async registrarse(datos: FormData) {
    this.enviando.set(true);
    try {
      const respuesta = await this.auth.registro(datos);
      this.sesion.iniciar(respuesta);
      await this.modal.exito('¡Bienvenido al fogón!', `Tu cuenta @${respuesta.usuario.nombreUsuario} está lista.`);
      this.router.navigate(['/publicaciones']);
    } catch (error) {
      this.modal.error('No pudimos crear tu cuenta', mensajeDeError(error));
    } finally {
      this.enviando.set(false);
    }
  }
}