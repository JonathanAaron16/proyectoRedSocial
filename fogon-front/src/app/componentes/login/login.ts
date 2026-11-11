import { Component, inject, signal,input } from '@angular/core';
import { RouterLink,Router } from '@angular/router';
import { form, FormField, required, minLength, validate } from '@angular/forms/signals';
import { ErroresCampo } from '../errores-campo/errores-campo';
import { LoginData } from '../../models/login-data';
import { Auth } from '../../servicios/auth';
import { Sesion } from '../../servicios/sesion';
import { Modal } from '../../servicios/modal';
import { mensajeDeError } from '../../utils/mensaje-error';

@Component({
  selector: 'app-login',
  imports: [RouterLink, FormField, ErroresCampo],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  modelo = signal<LoginData>({ identificador: '', password: '' });
  motivo = input<string>(); // viene de la URL: /login?motivo=sesion-vencida
  
  loginForm = form(this.modelo, (s) => {
    required(s.identificador, { message: 'Ingresá tu correo o nombre de usuario' });

    required(s.password, { message: 'Ingresá tu contraseña' });
   validate(s.password, ({ value }) => {
      const password = value();
      const valida = password.length >= 8 && /[A-Z]/.test(password) && /\d/.test(password);
      return password && !valida
        ? { kind: 'formato', message: 'La contraseña no es válida' }
        : null;
    });

  });

  mostrarPassword = signal(false);

  private auth = inject(Auth);
  private sesion = inject(Sesion);
  private modal = inject(Modal);
  private router = inject(Router);

  enviando = signal(false);

  async entrar(event: Event) {
    event.preventDefault();
    if (this.loginForm().invalid()) {
      this.loginForm().markAsTouched();
      return;
    }

    this.enviando.set(true);
    try {
      const usuario = await this.auth.login(this.modelo());
      this.sesion.iniciar(usuario);
      this.router.navigate(['/publicaciones']);
    } catch (error) {
      this.modal.error('No pudimos dejarte entrar', mensajeDeError(error));
    } finally {
      this.enviando.set(false);
    }
  }
}