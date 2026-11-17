import { Component, OnDestroy, input, output, signal } from '@angular/core';
import { form, FormField, required, email, minLength, maxLength, pattern, validate } from '@angular/forms/signals';
import { ErroresCampo } from '../errores-campo/errores-campo';
import { RegistroData } from '../../models/registro-data';
import { validarImagen } from '../../utils/validar-imagen';
import { AutoAltura } from '../../directivas/auto-altura';

type Perfil = 'usuario' | 'administrador';

const MODELO_VACIO: RegistroData = {
  nombre: '',
  apellido: '',
  correo: '',
  nombreUsuario: '',
  password: '',
  repetirPassword: '',
  fechaNacimiento: '',
  descripcion: '',
};

@Component({
  selector: 'app-formulario-usuario',
  imports: [FormField, ErroresCampo,AutoAltura],
  templateUrl: './formulario-usuario.html',
  styleUrl: './formulario-usuario.css',
})
export class FormularioUsuario implements OnDestroy {
  // Configuración desde el componente que lo usa
  mostrarPerfil = input(false);
  enviando = input(false);
  textoBoton = input('Crear cuenta');
  textoEnviando = input('Creando…');

  // Avisa con los datos listos para mandar al back
  enviar = output<FormData>();

  modelo = signal<RegistroData>({ ...MODELO_VACIO });
  perfil = signal<Perfil>('usuario');

  usuarioForm = form(this.modelo, (s) => {
    required(s.nombre, { message: 'El nombre es obligatorio' });
    maxLength(s.nombre, 50, { message: 'Máximo 50 caracteres' });

    required(s.apellido, { message: 'El apellido es obligatorio' });
    maxLength(s.apellido, 50, { message: 'Máximo 50 caracteres' });

    required(s.correo, { message: 'El correo es obligatorio' });
    email(s.correo, { message: 'El correo no es válido' });
    validate(s.correo, ({ value }) =>
      value() && !value().endsWith('.com')
        ? { kind: 'dominio', message: 'El correo tiene que ser @fogon.com' }
        : null,
    );

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

  imagen = signal<File | null>(null);
  vistaPrevia = signal<string | null>(null);
  errorImagen = signal<string | null>(null);
  mostrarPasswords = signal(false);

  elegirImagen(event: Event) {
    const input = event.target as HTMLInputElement;
    const archivo = input.files?.[0] ?? null;
    this.limpiarImagen();
    if (!archivo) return;

    const error = validarImagen(archivo);
    if (error) {
      this.errorImagen.set(error);
      input.value = '';
      return;
    }
    this.imagen.set(archivo);
    this.vistaPrevia.set(URL.createObjectURL(archivo));
  }

  quitarImagen(input: HTMLInputElement) {
    input.value = '';
    this.limpiarImagen();
  }

  alEnviar(event: Event) {
    event.preventDefault();
    if (this.usuarioForm().invalid() || this.errorImagen()) {
      this.usuarioForm().markAsTouched();
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
    if (this.mostrarPerfil()) datos.append('perfil', this.perfil());

    this.enviar.emit(datos);
  }

  // El componente que lo usa lo llama después de un alta exitosa
  reiniciar() {
    this.modelo.set({ ...MODELO_VACIO });
    this.perfil.set('usuario');
    this.usuarioForm().reset();
    this.limpiarImagen();
  }

  ngOnDestroy() {
    this.limpiarImagen();
  }

  private limpiarImagen() {
    const url = this.vistaPrevia();
    if (url) URL.revokeObjectURL(url);
    this.vistaPrevia.set(null);
    this.imagen.set(null);
    this.errorImagen.set(null);
  }
}