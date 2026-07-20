import { Component, Inject, ChangeDetectionStrategy } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { Task } from '../../models/task.model';
import { Label } from '../../models/label.model';
import { LabelPickerComponent } from '../label-picker/label-picker.component';
import { ChecklistEditorComponent } from '../checklist-editor/checklist-editor.component';
import { CommentListComponent } from '../comment-list/comment-list.component';
import { AttachmentListComponent } from '../attachment-list/attachment-list.component';

export interface TaskDialogData {
  task: Partial<Task>;
  enableDelete: boolean;
}

@Component({
  selector: 'app-task-dialog',
  imports: [
    FormsModule,
    NgTemplateOutlet,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatTooltipModule,
    MatTabsModule,
    LabelPickerComponent,
    ChecklistEditorComponent,
    CommentListComponent,
    AttachmentListComponent,
  ],
  templateUrl: './task-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./task-dialog.component.scss'],
})
export class TaskDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<TaskDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TaskDialogData,
  ) {}

  onLabelsChanged(labels: Label[]): void {
    this.data.task.labels = labels;
  }

  // Cache do Date convertido: o datepicker é ligado via [(ngModel)], então este
  // getter roda em todo ciclo de detecção de mudanças. Sem o cache, cada chamada
  // devolveria uma instância de Date nova (mesmo valor, referência diferente), o
  // que o datepicker interpreta como mudança externa a cada ciclo e reescreve o
  // input — reagendando outro ciclo indefinidamente e travando a aba.
  private dueDateCache: { iso: string | null; date: Date | null } = { iso: undefined as unknown as null, date: null };

  get dueDateValue(): Date | null {
    const iso = this.data.task.dueDate ?? null;
    if (this.dueDateCache.iso !== iso) {
      this.dueDateCache = { iso, date: iso ? this.parseIsoDate(iso) : null };
    }
    return this.dueDateCache.date;
  }

  set dueDateValue(value: Date | null) {
    this.data.task.dueDate = value ? this.toIsoDate(value) : null;
  }

  cancel(): void {
    this.dialogRef.close();
  }

  private parseIsoDate(iso: string): Date {
    const [year, month, day] = iso.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  private toIsoDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
