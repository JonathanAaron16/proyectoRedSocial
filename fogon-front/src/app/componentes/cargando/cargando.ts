import { Component, OnInit, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '../../servicios/auth';
import { Sesion } from '../../servicios/sesion';


const TIEMPO_MINIMO_MS = 1500; // para que se alcance a ver el spinner

const esperar = (ms: number) => new Promise((resolver) => setTimeout(resolver, ms));

@Component({
  selector: 'app-cargando',
  templateUrl: './cargando.html',
  styleUrl: './cargando.css',
})

export class Cargando implements OnInit {
  private auth = inject(Auth);
  private sesion = inject(Sesion);
  private router = inject(Router);

  volver = input<string>(); // viene de la URL: /cargando?volver=/mi-perfil

 async ngOnInit() {
  const minimo = esperar(TIEMPO_MINIMO_MS); // arranca a contar ya, en paralelo con autorizar
  try {
    const respuesta  = await this.auth.autorizar();        // POST /auth/autorizar
    await minimo;
    this.sesion.iniciar(respuesta);
    this.router.navigateByUrl(this.destino(), { replaceUrl: true });   // válido → publicaciones (o a donde ibas)
  } catch {
    await minimo;
    this.router.navigate(['/login'], { replaceUrl: true });            // no válido → login
  }
}
  // Solo rutas internas de la app: evita que alguien arme un link que redirija a otro sitio
  private destino() {
    const volver = this.volver();
    return volver && volver.startsWith('/') && !volver.startsWith('//') ? volver : '/publicaciones';
  }
}