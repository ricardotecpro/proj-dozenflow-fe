import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

import { HttpErrorResponse } from '@angular/common/http';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { forkJoin } from 'rxjs';
import { TaskList } from '../../models/list.model';
import { Task } from '../../models/task.model';
import { ListService } from '../../services/list.service';
import { TaskService } from '../../services/task.service';
import { NotificationService } from '../../services/notification.service';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-archive-panel',
  imports: [MatDialogModule, MatButtonModule, MatIconModule, MatTooltipModule, MatProgressSpinnerModule],
  templateUrl: './archive-panel.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./archive-panel.component.scss'],
})
export class ArchivePanelComponent implements OnInit {
  archivedLists: TaskList[] = [];
  archivedTasks: Task[] = [];
  loading = true;

  constructor(
    private listService: ListService,
    private taskService: TaskService,
    private dialog: MatDialog,
    private notificationService: NotificationService,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  private friendlyErrorMessage(err: unknown, fallback: string): string {
    if (err instanceof HttpErrorResponse && (err.status === 504 || err.status === 0)) {
      return 'O servidor está iniciando, tente novamente em alguns segundos.';
    }
    return fallback;
  }

  private load(): void {
    this.loading = true;
    forkJoin([this.listService.getArchivedLists(), this.taskService.getArchivedTasks()]).subscribe({
      next: ([lists, tasks]) => {
        this.archivedLists = lists;
        this.archivedTasks = tasks;
        this.loading = false;
      },
      error: (err: unknown) => {
        this.loading = false;
        this.notificationService.error(
          this.friendlyErrorMessage(err, 'Não foi possível carregar os itens arquivados.'),
        );
      },
    });
  }

  restoreList(list: TaskList): void {
    this.listService.restoreList(list.id).subscribe({
      next: () => {
        this.archivedLists = this.archivedLists.filter((l) => l.id !== list.id);
        this.notificationService.success('Lista restaurada.');
      },
      error: (err: unknown) =>
        this.notificationService.error(this.friendlyErrorMessage(err, 'Não foi possível restaurar a lista.')),
    });
  }

  deleteListForever(list: TaskList): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '360px',
      data: {
        title: 'Excluir lista permanentemente',
        message: `Tem certeza que deseja excluir a lista "${list.name}" e seus cartões arquivados? Essa ação não pode ser desfeita.`,
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) {
        return;
      }
      this.listService.deleteList(list.id).subscribe({
        next: () => {
          this.archivedLists = this.archivedLists.filter((l) => l.id !== list.id);
          this.archivedTasks = this.archivedTasks.filter((t) => t.listId !== list.id);
          this.notificationService.success('Lista excluída permanentemente.');
        },
        error: (err: unknown) =>
          this.notificationService.error(this.friendlyErrorMessage(err, 'Não foi possível excluir a lista.')),
      });
    });
  }

  restoreTask(task: Task): void {
    this.taskService.restoreTask(task.id).subscribe({
      next: () => {
        this.archivedTasks = this.archivedTasks.filter((t) => t.id !== task.id);
        this.notificationService.success(
          'Cartão restaurado. Se a lista dele estava arquivada, ela foi restaurada também.',
        );
      },
      error: (err: unknown) =>
        this.notificationService.error(this.friendlyErrorMessage(err, 'Não foi possível restaurar o cartão.')),
    });
  }

  deleteTaskForever(task: Task): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '360px',
      data: {
        title: 'Excluir cartão permanentemente',
        message: `Tem certeza que deseja excluir o cartão "${task.title}"? Essa ação não pode ser desfeita.`,
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) {
        return;
      }
      this.taskService.deleteTask(task.id).subscribe({
        next: () => {
          this.archivedTasks = this.archivedTasks.filter((t) => t.id !== task.id);
          this.notificationService.success('Cartão excluído permanentemente.');
        },
        error: (err: unknown) =>
          this.notificationService.error(this.friendlyErrorMessage(err, 'Não foi possível excluir o cartão.')),
      });
    });
  }
}
