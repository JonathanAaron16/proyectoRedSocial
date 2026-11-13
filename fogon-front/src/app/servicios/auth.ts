import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoginData } from '../models/login-data';
import { RespuestaSesion, Usuario } from '../models/usuario';

@Injectable({ providedIn: 'root' })
export class Auth {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/auth`;

  login(datos: LoginData) {
    return firstValueFrom(this.http.post<RespuestaSesion>(`${this.url}/login`, datos));
  }
  registro(datos: FormData) {
    return firstValueFrom(this.http.post<RespuestaSesion>(`${this.url}/registro`, datos));
  }
  autorizar() {
    return firstValueFrom(this.http.post<RespuestaSesion>(`${this.url}/autorizar`, {}));
  }
  refrescar() {
    return firstValueFrom(this.http.post<RespuestaSesion>(`${this.url}/refrescar`, {}));
  }
  cerrarSesion() {
    return firstValueFrom(this.http.post<void>(`${this.url}/cerrar-sesion`, {}));
  }
}