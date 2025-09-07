import { Component } from '@angular/core';
import { KanbanBoardComponent } from './components/kanban-board/kanban-board.component';
import { ThemeToggleComponent } from './components/theme-toggle/theme-toggle.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [KanbanBoardComponent, ThemeToggleComponent, MatToolbarModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  // Injetar o ThemeService aqui garante que ele seja instanciado quando a aplicação iniciar.
  constructor(private themeService: ThemeService) {}
}
