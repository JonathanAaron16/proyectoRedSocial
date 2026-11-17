import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';
import { adminGuard } from './guards/admin-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'cargando', pathMatch: 'full' },
  {
    path: 'cargando',
    loadComponent: () => import('./componentes/cargando/cargando').then(m => m.Cargando),
  },
  
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
        path: 'publicaciones/:id',
        loadComponent: () =>
          import('./componentes/detalle-publicacion/detalle-publicacion').then(m => m.DetallePublicacion),
      },
      {
        path: 'mi-perfil',
        loadComponent: () => import('./componentes/mi-perfil/mi-perfil').then(m => m.MiPerfil),
      },
      {
        path: 'dashboard/usuarios',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./componentes/dashboard-usuarios/dashboard-usuarios').then(m => m.DashboardUsuarios),
      },
      {
        path: 'dashboard/estadisticas',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./componentes/dashboard-estadisticas/dashboard-estadisticas').then(m => m.DashboardEstadisticas),
      },
    ],
  },
  {
    path: '**',
    loadComponent: () => import('./componentes/no-encontrado/no-encontrado').then(m => m.NoEncontrado),
  },
];