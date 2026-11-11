import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { Comentario, PaginaComentarios } from '../models/comentario';

@Injectable({ providedIn: 'root' })
export class Comentarios {
  private http = inject(HttpClient);

  private url(publicacionId: string) {
    return `${environment.apiUrl}/publicaciones/${publicacionId}/comentarios`;
  }

  listar(publicacionId: string, offset = 0, limit = 5) {
    const params = new HttpParams().set('offset', offset).set('limit', limit);
    return firstValueFrom(this.http.get<PaginaComentarios>(this.url(publicacionId), { params }));
  }

  crear(publicacionId: string, mensaje: string) {
    return firstValueFrom(this.http.post<Comentario>(this.url(publicacionId), { mensaje }));
  }

  editar(publicacionId: string, comentarioId: string, mensaje: string) {
    return firstValueFrom(
      this.http.put<Comentario>(`${this.url(publicacionId)}/${comentarioId}`, { mensaje }),
    );
  }
}