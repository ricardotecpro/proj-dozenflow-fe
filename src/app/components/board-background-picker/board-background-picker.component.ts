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
import { NotificationService } from '../../services/notification.service';

const MAX_SIZE_BYTES = 5 * 1024 * 1024;

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
  hasImage$: Observable<boolean>;

  constructor(
    private boardBackgroundService: BoardBackgroundService,
    private notificationService: NotificationService,
  ) {
    this.selectedId$ = this.boardBackgroundService.selectedId$;
    this.hasImage$ = this.boardBackgroundService.hasImage$;
  }

  select(option: BoardBackgroundOption): void {
    this.boardBackgroundService.select(option.id);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) {
      return;
    }

    if (file.size > MAX_SIZE_BYTES) {
      this.notificationService.error('O arquivo excede o limite de 5MB.');
      return;
    }

    this.boardBackgroundService.uploadBackgroundImage(file);
  }

  removeImage(): void {
    this.boardBackgroundService.removeBackgroundImage();
  }
}
