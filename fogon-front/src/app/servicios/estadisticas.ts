import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  ComentariosEnRango, ComentariosPorPublicacion, PublicacionesPorUsuario, RangoFechas,
} from '../models/estadisticas';

@Injectable({ providedIn: 'root' })
export class Estadisticas {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/estadisticas`;

  publicacionesPorUsuario(rango: RangoFechas) {
    return firstValueFrom(
      this.http.get<PublicacionesPorUsuario[]>(`${this.url}/publicaciones-por-usuario`, { params: this.params(rango) }),
    );
  }

  comentarios(rango: RangoFechas) {
    return firstValueFrom(
      this.http.get<ComentariosEnRango>(`${this.url}/comentarios`, { params: this.params(rango) }),
    );
  }

  comentariosPorPublicacion(rango: RangoFechas) {
    return firstValueFrom(
      this.http.get<ComentariosPorPublicacion[]>(`${this.url}/comentarios-por-publicacion`, { params: this.params(rango) }),
    );
  }

  private params({ desde, hasta }: RangoFechas) {
    return new HttpParams().set('desde', desde).set('hasta', hasta);
  }
}