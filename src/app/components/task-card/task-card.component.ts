import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy } from '@angular/core';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Task } from '../../models/task.model';

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
  @Output() delete = new EventEmitter<void>();
}
