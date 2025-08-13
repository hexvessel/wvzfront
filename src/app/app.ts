import { Component, signal } from '@angular/core';
import { Game } from './game/game';
//import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [Game],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('WizardsVSZombies');
}
