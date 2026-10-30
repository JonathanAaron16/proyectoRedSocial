import { Component, input } from '@angular/core';
import { ReadonlyFieldTree } from '@angular/forms/signals';

@Component({
  selector: 'app-errores-campo',
  templateUrl: './errores-campo.html',
})
export class ErroresCampo {
  campo = input.required<ReadonlyFieldTree<unknown>>();
}