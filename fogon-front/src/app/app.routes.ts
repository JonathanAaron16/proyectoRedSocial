import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./componentes/login/login').then(m => m.Login),
  },
  {
    path: 'registro',
    loadComponent: () => import('./componentes/registro/registro').then(m => m.Registro),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./componentes/principal/principal').then(m => m.Principal),
    children: [
      {
        path: 'publicaciones',
        loadComponent: () => import('./componentes/publicaciones/publicaciones').then(m => m.Publicaciones),
      },
      {
        path: 'mi-perfil',
        loadComponent: () => import('./componentes/mi-perfil/mi-perfil').then(m => m.MiPerfil),
      },
    ],
  },
  {
    path: '**',
    loadComponent: () => import('./componentes/no-encontrado/no-encontrado').then(m => m.NoEncontrado),
  },
];