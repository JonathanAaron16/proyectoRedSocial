import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { EstadoMeGusta, OrdenPublicaciones, PaginaPublicaciones, Publicacion } from '../models/publicacion';

export interface OpcionesListado {
  orden?: OrdenPublicaciones;
  usuario?: string;
  offset?: number;
  limit?: number;
}

@Injectable({ providedIn: 'root' })
export class Publicaciones {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/publicaciones`;

  listar(opciones: OpcionesListado = {}) {
    let params = new HttpParams();
    for (const [clave, valor] of Object.entries(opciones)) {
      if (valor !== undefined && valor !== '') params = params.set(clave, String(valor));
    }
    return firstValueFrom(this.http.get<PaginaPublicaciones>(this.url, { params }));
  }

  crear(datos: FormData) {
    return firstValueFrom(this.http.post<Publicacion>(this.url, datos));
  }

  eliminar(id: string) {
    return firstValueFrom(this.http.delete<void>(`${this.url}/${id}`));
  }

  darMeGusta(id: string) {
    return firstValueFrom(this.http.post<EstadoMeGusta>(`${this.url}/${id}/me-gusta`, {}));
  }

  quitarMeGusta(id: string) {
    return firstValueFrom(this.http.delete<EstadoMeGusta>(`${this.url}/${id}/me-gusta`));
  }
  
  obtener(id: string) {
    return firstValueFrom(this.http.get<Publicacion>(`${this.url}/${id}`));
  }
}