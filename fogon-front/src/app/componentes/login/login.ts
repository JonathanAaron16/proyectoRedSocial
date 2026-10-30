import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { form, FormField, required, minLength, validate } from '@angular/forms/signals';
import { ErroresCampo } from '../errores-campo/errores-campo';
import { LoginData } from '../../models/login-data';

@Component({
  selector: 'app-login',
  imports: [RouterLink, FormField, ErroresCampo],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  modelo = signal<LoginData>({ identificador: '', password: '' });

  loginForm = form(this.modelo, (s) => {
    required(s.identificador, { message: 'Ingresá tu correo o nombre de usuario' });

    required(s.password, { message: 'Ingresá tu contraseña' });
    minLength(s.password, 8, { message: 'Tiene que tener al menos 8 caracteres' });
    validate(s.password, ({ value }) =>
      value() && !/[A-Z]/.test(value())
        ? { kind: 'mayuscula', message: 'Tiene que tener al menos una mayúscula' }
        : null,
    );
    validate(s.password, ({ value }) =>
      value() && !/\d/.test(value())
        ? { kind: 'numero', message: 'Tiene que tener al menos un número' }
        : null,
    );
  });

  mostrarPassword = signal(false);

  entrar(event: Event) {
    event.preventDefault();
    if (this.loginForm().invalid()) {
      this.loginForm().markAsTouched();
      return;
    }
    // Paso siguiente: enviar al back
    console.log('Login válido:', this.modelo());
  }
}