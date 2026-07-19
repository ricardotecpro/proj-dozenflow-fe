import { Component, ChangeDetectionStrategy } from '@angular/core';
import { KanbanBoardComponent } from './components/kanban-board/kanban-board.component';
import { ThemeToggleComponent } from './components/theme-toggle/theme-toggle.component';
import { BoardBackgroundPickerComponent } from './components/board-background-picker/board-background-picker.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ThemeService } from './services/theme.service';
import { BoardBackgroundService } from './services/board-background.service';

@Component({
  selector: 'app-root',
  imports: [KanbanBoardComponent, ThemeToggleComponent, BoardBackgroundPickerComponent, MatToolbarModule],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  // Injetar os serviços aqui garante que sejam instanciados (e apliquem a
  // preferência salva) assim que a aplicação iniciar.
  constructor(
    private themeService: ThemeService,
    private boardBackgroundService: BoardBackgroundService,
  ) {}
}
