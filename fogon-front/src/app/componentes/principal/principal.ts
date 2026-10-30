import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Tema } from '../../servicios/tema';

@Component({
  selector: 'app-principal',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './principal.html',
  styleUrl: './principal.css',
})
export class Principal {
  tema = inject(Tema);
}