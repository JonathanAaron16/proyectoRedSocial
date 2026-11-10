import { Component, OnDestroy, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { form, FormField, required, email, minLength, maxLength, pattern, validate } from '@angular/forms/signals';
import { ErroresCampo } from '../errores-campo/errores-campo';
import { RegistroData } from '../../models/registro-data';
import { Auth } from '../../servicios/auth';
import { Sesion } from '../../servicios/sesion';
import { Modal } from '../../servicios/modal';
import { mensajeDeError } from '../../utils/mensaje-error';
import { validarImagen } from '../../utils/validar-imagen';

// const TIPOS_IMAGEN = ['image/jpeg', 'image/png', 'image/webp'];
// const MAX_IMAGEN = 2 * 1024 * 1024; // 2 MB, igual que el back

@Component({
  selector: 'app-registro',
  imports: [RouterLink, FormField, ErroresCampo],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class Registro implements OnDestroy {
  private auth = inject(Auth);
  private sesion = inject(Sesion);
  private modal = inject(Modal);
  private router = inject(Router);

  modelo = signal<RegistroData>({
    nombre: '',
    apellido: '',
    correo: '',
    nombreUsuario: '',
    password: '',
    repetirPassword: '',
    fechaNacimiento: '',
    descripcion: '',
  });

  registroForm = form(this.modelo, (s) => {
    required(s.nombre, { message: 'El nombre es obligatorio' });
    maxLength(s.nombre, 50, { message: 'Máximo 50 caracteres' });

    required(s.apellido, { message: 'El apellido es obligatorio' });
    maxLength(s.apellido, 50, { message: 'Máximo 50 caracteres' });

    required(s.correo, { message: 'El correo es obligatorio' });
    email(s.correo, { message: 'El correo no es válido' });

    required(s.nombreUsuario, { message: 'El nombre de usuario es obligatorio' });
    pattern(s.nombreUsuario, /^[a-zA-Z0-9._]{3,20}$/, {
      message: 'Entre 3 y 20 caracteres: letras, números, punto o guion bajo',
    });

    required(s.password, { message: 'La contraseña es obligatoria' });
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

    required(s.repetirPassword, { message: 'Repetí la contraseña' });
    validate(s.repetirPassword, ({ value, valueOf }) =>
      value() && value() !== valueOf(s.password)
        ? { kind: 'noCoinciden', message: 'Las contraseñas no coinciden' }
        : null,
    );

    required(s.fechaNacimiento, { message: 'La fecha de nacimiento es obligatoria' });
    validate(s.fechaNacimiento, ({ value }) =>
      value() && new Date(value()) > new Date()
        ? { kind: 'futura', message: 'La fecha no puede ser futura' }
        : null,
    );

    maxLength(s.descripcion, 200, { message: 'Máximo 200 caracteres' });
  });

  // ----- Imagen de perfil (va aparte del formulario) -----
  imagen = signal<File | null>(null);
  vistaPrevia = signal<string | null>(null);
  errorImagen = signal<string | null>(null);
  

  mostrarPasswords = signal(false);
  enviando = signal(false);

  elegirImagen(event: Event) {
    const input = event.target as HTMLInputElement;
    const archivo = input.files?.[0] ?? null;
    this.limpiarVistaPrevia();
    this.imagen.set(null);
    this.errorImagen.set(null);

    if (!archivo) return; // no eligió nada: está bien, es opcional

    var error = validarImagen(archivo);
    if (error) {
      this.errorImagen.set(error);
      return;
    }

    this.imagen.set(archivo);
    this.vistaPrevia.set(URL.createObjectURL(archivo));
  }

  quitarImagen(input: HTMLInputElement) {
    input.value = '';
    this.limpiarVistaPrevia();
    this.imagen.set(null);
    this.errorImagen.set(null);
  }

  async registrarse(event: Event) {
    event.preventDefault();

    if (this.registroForm().invalid() || this.errorImagen()) {
      this.registroForm().markAsTouched();
      return;
    }

    const d = this.modelo();
    const datos = new FormData();

    datos.append('nombre', d.nombre);
    datos.append('apellido', d.apellido);
    datos.append('correo', d.correo);
    datos.append('nombreUsuario', d.nombreUsuario);
    datos.append('password', d.password);
    datos.append('fechaNacimiento', d.fechaNacimiento);
    datos.append('descripcion', d.descripcion);

    const imagen = this.imagen();
    if (imagen) datos.append('imagen', imagen);

    this.enviando.set(true);
    try {
      const usuario = await this.auth.registro(datos);
      this.sesion.iniciar(usuario);
      await this.modal.exito('¡Bienvenido al fogón!', `Tu cuenta @${usuario.nombreUsuario} está lista.`);
      this.router.navigate(['/publicaciones']);
    } catch (error) {
      this.modal.error('No pudimos crear tu cuenta', mensajeDeError(error));
    } finally {
      this.enviando.set(false);
    }
  }

  ngOnDestroy() {
    this.limpiarVistaPrevia();
  }

  private limpiarVistaPrevia() {
    const url = this.vistaPrevia();
    if (url) URL.revokeObjectURL(url);
    this.vistaPrevia.set(null);
  }
}