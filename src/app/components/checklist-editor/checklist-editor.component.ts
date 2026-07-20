import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ChecklistItem } from '../../models/checklist-item.model';
import { ChecklistItemService } from '../../services/checklist-item.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-checklist-editor',
  imports: [FormsModule, MatCheckboxModule, MatIconModule, MatButtonModule],
  templateUrl: './checklist-editor.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./checklist-editor.component.scss'],
})
export class ChecklistEditorComponent implements OnInit {
  @Input({ required: true }) taskId!: number;

  items: ChecklistItem[] = [];
  newItemTitle = '';

  constructor(
    private checklistItemService: ChecklistItemService,
    private notificationService: NotificationService,
  ) {}

  get doneCount(): number {
    return this.items.filter((item) => item.done).length;
  }

  ngOnInit(): void {
    this.loadItems();
  }

  toggle(item: ChecklistItem): void {
    this.checklistItemService.updateItem(this.taskId, item.id, { ...item, done: !item.done }).subscribe({
      next: (updated) => {
        item.done = updated.done;
      },
      error: () => this.notificationService.error('Não foi possível atualizar o item.'),
    });
  }

  addItem(): void {
    const title = this.newItemTitle.trim();
    if (!title) {
      return;
    }

    this.checklistItemService.createItem(this.taskId, { title, done: false, itemOrder: this.items.length }).subscribe({
      next: (item) => {
        this.items.push(item);
        this.newItemTitle = '';
      },
      error: () => this.notificationService.error('Não foi possível adicionar o item.'),
    });
  }

  removeItem(item: ChecklistItem): void {
    this.checklistItemService.deleteItem(this.taskId, item.id).subscribe({
      next: () => {
        this.items = this.items.filter((existing) => existing.id !== item.id);
      },
      error: () => this.notificationService.error('Não foi possível remover o item.'),
    });
  }

  private loadItems(): void {
    this.checklistItemService.getItems(this.taskId).subscribe({
      next: (items) => (this.items = items),
      error: () => this.notificationService.error('Não foi possível carregar o checklist.'),
    });
  }
}
