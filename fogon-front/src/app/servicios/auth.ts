import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoginData } from '../models/login-data';
import { Usuario } from '../models/usuario';

@Injectable({ providedIn: 'root' })
export class Auth {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/auth`;

  login(datos: LoginData) {
    return firstValueFrom(this.http.post<Usuario>(`${this.url}/login`, datos));
  }
  autorizar() {
    return firstValueFrom(this.http.post<Usuario>(`${this.url}/autorizar`, {}));
  }
  cerrarSesion() {
    return firstValueFrom(this.http.post<void>(`${this.url}/cerrar-sesion`, {}));
  }
}