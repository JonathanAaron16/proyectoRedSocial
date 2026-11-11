import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter,withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { registerLocaleData } from '@angular/common';
import localeEsAr from '@angular/common/locales/es-AR';
import { routes } from './app.routes';
import { credencialesInterceptor } from './interceptores/credenciales-interceptor';
import { sesionInterceptor } from './interceptores/sesion-interceptor';

registerLocaleData(localeEsAr);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([credencialesInterceptor, sesionInterceptor])),
    { provide: LOCALE_ID, useValue: 'es-AR' },
  ],
};