export interface PayloadToken {
  sub: string;
  nombreUsuario: string;
  perfil: 'usuario' | 'administrador';
}