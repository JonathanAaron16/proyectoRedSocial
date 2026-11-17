import { Injectable, inject } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { Modal } from './modal';

@Injectable({ providedIn: 'root' })
export class Actualizaciones {
  private sw = inject(SwUpdate);
  private modal = inject(Modal);

  constructor() {
    // En desarrollo (ng serve) el service worker está apagado
    if (!this.sw.isEnabled) return;

    // Ya se descargó una versión nueva y está lista para usarse
    this.sw.versionUpdates
      .pipe(
        filter((evento): evento is VersionReadyEvent => evento.type === 'VERSION_READY'),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.avisarVersionNueva());

    // La versión guardada se rompió (por ejemplo, el navegador borró parte del caché)
    this.sw.unrecoverable.pipe(takeUntilDestroyed()).subscribe(async () => {
      await this.modal.error('Hay que recargar Fogón', 'Ocurrió un problema con la versión guardada. Vamos a recargar la página.');
      document.location.reload();
    });
  }

  private async avisarVersionNueva() {
    const actualizar = await this.modal.confirmar(
      'Hay una versión nueva de Fogón',
      'Actualizá para ver los últimos cambios. Si estás escribiendo algo, terminalo antes.',
      'Actualizar ahora',
    );
    if (actualizar) document.location.reload();
  }
}