import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormularioUsuario } from '../formulario-usuario/formulario-usuario';
import { Usuarios } from '../../servicios/usuarios';
import { Sesion } from '../../servicios/sesion';
import { Modal } from '../../servicios/modal';
import { Usuario } from '../../models/usuario';
import { mensajeDeError } from '../../utils/mensaje-error';

@Component({
  selector: 'app-dashboard-usuarios',
  imports: [DatePipe, FormularioUsuario],
  templateUrl: './dashboard-usuarios.html',
  styleUrl: './dashboard-usuarios.css',
})
export class DashboardUsuarios {
  private usuariosService = inject(Usuarios);
  private sesion = inject(Sesion);
  private modal = inject(Modal);

  private formulario = viewChild(FormularioUsuario);

  usuarios = signal<Usuario[]>([]);
  cargando = signal(true);
  error = signal<string | null>(null);

  mostrarFormulario = signal(false);
  creando = signal(false);
  procesando = signal<string | null>(null); // id del usuario que se está habilitando o deshabilitando

  cantidadActivos = computed(() => this.usuarios().filter((u) => u.activo).length);

  constructor() {
    this.cargar();
  }

  async cargar() {
    this.cargando.set(true);
    this.error.set(null);
    try {
      this.usuarios.set(await this.usuariosService.listar());
    } catch (error) {
      this.error.set(mensajeDeError(error));
    } finally {
      this.cargando.set(false);
    }
  }

  esYo(usuario: Usuario) {
    return usuario._id === this.sesion.usuario()?._id;
  }

  async crear(datos: FormData) {
    this.creando.set(true);
    try {
      const nuevo = await this.usuariosService.crear(datos);
      this.usuarios.update((lista) => [nuevo, ...lista]);
      this.formulario()?.reiniciar();
      this.mostrarFormulario.set(false);
      this.modal.exito('Usuario creado', `@${nuevo.nombreUsuario} ya puede ingresar al fogón.`);
    } catch (error) {
      this.modal.error('No pudimos crear el usuario', mensajeDeError(error));
    } finally {
      this.creando.set(false);
    }
  }

  async cambiarEstado(usuario: Usuario) {
    const deshabilitar = usuario.activo;
    const confirmado = await this.modal.confirmar(
      deshabilitar ? `¿Deshabilitar a @${usuario.nombreUsuario}?` : `¿Habilitar a @${usuario.nombreUsuario}?`,
      deshabilitar
        ? 'No va a poder ingresar a la aplicación hasta que lo vuelvas a habilitar.'
        : 'Va a poder volver a ingresar a la aplicación.',
      deshabilitar ? 'Deshabilitar' : 'Habilitar',
    );
    if (!confirmado) return;

    this.procesando.set(usuario._id);
    try {
      const actualizado = deshabilitar
        ? await this.usuariosService.deshabilitar(usuario._id)
        : await this.usuariosService.habilitar(usuario._id);
      this.usuarios.update((lista) => lista.map((u) => (u._id === actualizado._id ? actualizado : u)));
    } catch (error) {
      this.modal.error('No pudimos cambiar el estado', mensajeDeError(error));
    } finally {
      this.procesando.set(null);
    }
  }
}