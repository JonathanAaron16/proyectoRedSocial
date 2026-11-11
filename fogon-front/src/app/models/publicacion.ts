export interface AutorPublicacion {
  _id: string;
  nombre: string;
  apellido: string;
  nombreUsuario: string;
  imagenPerfil: string;
}

export interface Publicacion {
  _id: string;
  titulo: string;
  mensaje: string;
  imagen: string;
  autor: AutorPublicacion;
  cantidadLikes: number;
  cantidadComentarios?: number;//? porque las publicaciones creadas antes del Sprint 3 no tienen ese campo en la base.
  meGusta: boolean;
  createdAt: string;
}

export interface PaginaPublicaciones {
  publicaciones: Publicacion[];
  total: number;
}

export type OrdenPublicaciones = 'fecha' | 'likes';

export interface EstadoMeGusta {
  cantidadLikes: number;
  meGusta: boolean;
}