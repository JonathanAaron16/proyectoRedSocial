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