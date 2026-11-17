import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { Usuario } from '../models/usuario';

@Injectable({ providedIn: 'root' })
export class Usuarios {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/usuarios`;

  listar() {
    return firstValueFrom(this.http.get<Usuario[]>(this.url));
  }

  crear(datos: FormData) {
    return firstValueFrom(this.http.post<Usuario>(this.url, datos));
  }

  deshabilitar(id: string) {
    return firstValueFrom(this.http.delete<Usuario>(`${this.url}/${id}`));
  }

  habilitar(id: string) {
    return firstValueFrom(this.http.post<Usuario>(`${this.url}/${id}/habilitar`, {}));
  }
}