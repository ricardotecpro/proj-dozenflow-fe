import { Component, ChangeDetectionStrategy } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Observable } from 'rxjs';
import {
  BOARD_BACKGROUND_OPTIONS,
  BoardBackgroundOption,
  BoardBackgroundService,
} from '../../services/board-background.service';

@Component({
  selector: 'app-board-background-picker',
  imports: [AsyncPipe, MatIconModule, MatButtonModule, MatMenuModule, MatTooltipModule],
  templateUrl: './board-background-picker.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./board-background-picker.component.scss'],
})
export class BoardBackgroundPickerComponent {
  readonly options = BOARD_BACKGROUND_OPTIONS;
  selectedId$: Observable<string>;

  constructor(private boardBackgroundService: BoardBackgroundService) {
    this.selectedId$ = this.boardBackgroundService.selectedId$;
  }

  select(option: BoardBackgroundOption): void {
    this.boardBackgroundService.select(option.id);
  }
}
