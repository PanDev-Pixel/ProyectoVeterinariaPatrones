import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  title = 'veterinaria-frontend';
  
  constructor() {
    // Aplicar clase app-container al body para efectos Sakura
    document.body.classList.add('app-container');
  }
}
