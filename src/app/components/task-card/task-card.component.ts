import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy } from '@angular/core';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Task } from '../../models/task.model';
import { AttachmentService } from '../../services/attachment.service';

export type DueDateStatus = 'overdue' | 'due-soon' | 'default';

const DUE_SOON_THRESHOLD_DAYS = 2;

@Component({
  selector: 'app-task-card',
  imports: [MatCardModule, MatIconModule, MatButtonModule, MatMenuModule, MatTooltipModule],
  templateUrl: './task-card.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./task-card.component.scss'],
})
export class TaskCardComponent {
  @Input({ required: true }) task!: Task;
  @Output() edit = new EventEmitter<void>();
  @Output() archive = new EventEmitter<void>();

  constructor(private attachmentService: AttachmentService) {}

  get isFullCover(): boolean {
    return this.task.coverSize === 'FULL' && !!(this.task.coverColor || this.task.coverAttachmentId);
  }

  get coverImageUrl(): string | null {
    return this.task.coverAttachmentId
      ? this.attachmentService.viewUrl(this.task.id, this.task.coverAttachmentId)
      : null;
  }

  get dueDateStatus(): DueDateStatus | null {
    if (!this.task.dueDate) {
      return null;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffDays = Math.round((this.parseIsoDate(this.task.dueDate).getTime() - today.getTime()) / 86_400_000);

    if (diffDays < 0) {
      return 'overdue';
    }
    if (diffDays <= DUE_SOON_THRESHOLD_DAYS) {
      return 'due-soon';
    }
    return 'default';
  }

  get dueDateLabel(): string {
    if (!this.task.dueDate) {
      return '';
    }
    return new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'short' }).format(
      this.parseIsoDate(this.task.dueDate),
    );
  }

  private parseIsoDate(iso: string): Date {
    const [year, month, day] = iso.split('-').map(Number);
    return new Date(year, month - 1, day);
  }
}
