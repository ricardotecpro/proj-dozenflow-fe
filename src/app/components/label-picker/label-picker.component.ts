import { Component, EventEmitter, Input, OnInit, Output, ChangeDetectionStrategy } from '@angular/core';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Label } from '../../models/label.model';
import { LabelService } from '../../services/label.service';
import { TaskService } from '../../services/task.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-label-picker',
  imports: [MatIconModule, MatButtonModule, MatMenuModule, MatTooltipModule],
  templateUrl: './label-picker.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./label-picker.component.scss'],
})
export class LabelPickerComponent implements OnInit {
  @Input({ required: true }) taskId!: number;
  @Input() selectedLabels: Label[] = [];
  @Output() labelsChanged = new EventEmitter<Label[]>();

  allLabels: Label[] = [];

  constructor(
    private labelService: LabelService,
    private taskService: TaskService,
    private notificationService: NotificationService,
  ) {}

  ngOnInit(): void {
    this.labelService.getLabels().subscribe({
      next: (labels) => (this.allLabels = labels),
      error: () => this.notificationService.error('Não foi possível carregar as labels.'),
    });
  }

  isSelected(label: Label): boolean {
    return this.selectedLabels.some((selected) => selected.id === label.id);
  }

  toggle(label: Label): void {
    const request$ = this.isSelected(label)
      ? this.taskService.detachLabel(this.taskId, label.id)
      : this.taskService.attachLabel(this.taskId, label.id);

    request$.subscribe({
      next: (task) => this.labelsChanged.emit(task.labels),
      error: () => this.notificationService.error('Não foi possível atualizar as labels da tarefa.'),
    });
  }
}
