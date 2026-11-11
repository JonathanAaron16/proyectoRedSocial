import { AutorPublicacion } from './publicacion';

export interface Comentario {
  _id: string;
  publicacion: string;
  autor: AutorPublicacion;
  mensaje: string;
  modificado: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginaComentarios {
  comentarios: Comentario[];
  total: number;
}