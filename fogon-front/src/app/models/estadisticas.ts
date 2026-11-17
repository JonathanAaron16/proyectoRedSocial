export interface RangoFechas {
  desde: string; // 'YYYY-MM-DD'
  hasta: string;
}

export interface PublicacionesPorUsuario {
  usuarioId: string;
  nombreUsuario: string;
  cantidad: number;
}

export interface ComentariosPorDia {
  fecha: string; // 'YYYY-MM-DD'
  cantidad: number;
}

export interface ComentariosEnRango {
  total: number;
  porDia: ComentariosPorDia[];
}

export interface ComentariosPorPublicacion {
  publicacionId: string;
  titulo: string;
  cantidad: number;
}