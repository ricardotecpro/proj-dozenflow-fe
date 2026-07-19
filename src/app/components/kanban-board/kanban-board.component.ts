import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Observable, forkJoin, take } from 'rxjs';
import { Task, TaskStatus } from '../../models/task.model';
import { TaskService } from '../../services/task.service';
import { NotificationService } from '../../services/notification.service';
import { TaskDialogComponent, TaskDialogData } from '../task-dialog/task-dialog.component';
import { TaskCardComponent } from '../task-card/task-card.component';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';

type QuickAddKey = 'todo' | 'inProgress';

@Component({
  selector: 'app-kanban-board',
  imports: [
    FormsModule,
    DragDropModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    TaskCardComponent,
  ],
  templateUrl: './kanban-board.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./kanban-board.component.scss'],
})
export class KanbanBoardComponent implements OnInit {
  todoTasks: Task[] = [];
  inProgressTasks: Task[] = [];
  doneTasks: Task[] = [];
  loading = true;
  public TaskStatus = TaskStatus; // Torna o enum acessível para o template

  // Adição rápida de cartão (só título, estilo Trello) nas colunas
  // "A Fazer"/"Em Andamento" — "Concluída" mantém a decisão de não permitir
  // criar direto ali.
  quickAdd: Record<QuickAddKey, { open: boolean; title: string }> = {
    todo: { open: false, title: '' },
    inProgress: { open: false, title: '' },
  };

  constructor(
    private taskService: TaskService,
    public dialog: MatDialog,
    private breakpointObserver: BreakpointObserver,
    private notificationService: NotificationService,
  ) {}

  /** Mensagem amigável para erros de rede/timeout (ex.: cold start do backend no Render). */
  private friendlyErrorMessage(err: unknown, fallback: string): string {
    if (err instanceof HttpErrorResponse && (err.status === 504 || err.status === 0)) {
      return 'O servidor está iniciando, tente novamente em alguns segundos.';
    }
    return fallback;
  }

  /** Config de diálogo full-screen em telas pequenas, largura fixa em telas maiores. */
  private dialogConfig(desktopWidth: string): MatDialogConfig {
    const isHandset = this.breakpointObserver.isMatched(Breakpoints.Handset);
    return isHandset
      ? { width: '100vw', maxWidth: '100vw', height: '100%', panelClass: 'full-screen-dialog' }
      : { width: desktopWidth };
  }

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.loading = true;
    this.taskService.getTasks().subscribe({
      next: (tasks) => {
        // Garante que a ordem seja consistente com o backend
        const sortedTasks = tasks.sort((a, b) => a.taskOrder - b.taskOrder);

        this.todoTasks = sortedTasks.filter((t: Task) => t.status === TaskStatus.A_FAZER);
        this.inProgressTasks = sortedTasks.filter((t: Task) => t.status === TaskStatus.EM_ANDAMENTO);
        this.doneTasks = sortedTasks.filter((t: Task) => t.status === TaskStatus.CONCLUIDA);
        this.loading = false;
      },
      error: (err: unknown) => {
        this.loading = false;
        this.notificationService.error(this.friendlyErrorMessage(err, 'Não foi possível carregar as tarefas.'));
      },
    });
  }

  drop(event: CdkDragDrop<Task[]>) {
    // Se o item foi movido para o mesmo container, apenas reordena.
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      this.updateListOrder(event.container.data);
    } else {
      // Se foi movido para um container diferente, transfere o item.
      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);

      // Atualiza a ordem e o status de ambas as listas.
      const newStatus = this.getStatusFromContainerId(event.container.id);
      if (!newStatus) return; // Guarda de segurança, não deve acontecer com IDs corretos.

      this.updateListOrder(event.container.data, newStatus);
      this.updateListOrder(event.previousContainer.data);
    }
  }

  private updateListOrder(tasks: Task[], status?: TaskStatus): void {
    const updates: Observable<Task>[] = tasks.map((task, index) => {
      const updatedTask: Partial<Task> = {
        ...task,
        taskOrder: index,
      };
      if (status) {
        updatedTask.status = status;
      }
      return this.taskService.updateTask(task.id, updatedTask);
    });

    if (updates.length > 0) {
      forkJoin(updates)
        .pipe(take(1))
        .subscribe({
          error: (err: unknown) => {
            this.notificationService.error(
              this.friendlyErrorMessage(err, 'Não foi possível mover a tarefa. Desfazendo a alteração.'),
            );
            // Rollback simples: recarrega as tarefas do servidor para garantir consistência.
            this.loadTasks();
          },
        });
    }
  }

  private getStatusFromContainerId(containerId: string): TaskStatus | null {
    switch (containerId) {
      case 'todoList':
        return TaskStatus.A_FAZER;
      case 'inProgressList':
        return TaskStatus.EM_ANDAMENTO;
      case 'doneList':
        return TaskStatus.CONCLUIDA;
      default:
        return null;
    }
  }

  openTaskDialog(task?: Task, taskList?: Task[], status?: TaskStatus): void {
    const isNew = !task;
    const dialogData: TaskDialogData = {
      // Se for uma nova tarefa, cria um objeto vazio. Se for edição, cria uma cópia para não modificar o objeto original antes de salvar.
      task: isNew ? { title: '', description: '' } : { ...task },
      enableDelete: !isNew,
    };

    const dialogRef = this.dialog.open(TaskDialogComponent, {
      ...this.dialogConfig('400px'),
      data: dialogData,
    });

    dialogRef.afterClosed().subscribe((result: Partial<Task> | undefined) => {
      if (!result) {
        return;
      }

      if (result.id) {
        // Atualiza uma tarefa existente
        this.taskService.updateTask(result.id, result).subscribe({
          next: () => {
            this.loadTasks();
            this.notificationService.success('Tarefa atualizada.');
          },
          error: (err: unknown) =>
            this.notificationService.error(this.friendlyErrorMessage(err, 'Não foi possível atualizar a tarefa.')),
        });
      } else {
        // Cria uma nova tarefa, garantindo que tenha status e ordem
        if (status && taskList) {
          const newTask: Partial<Task> = {
            ...result,
            status: status,
            taskOrder: taskList.length, // Adiciona a nova tarefa no final da lista
          };
          this.taskService.createTask(newTask).subscribe({
            next: () => {
              this.loadTasks();
              this.notificationService.success('Tarefa criada.');
            },
            error: (err: unknown) =>
              this.notificationService.error(this.friendlyErrorMessage(err, 'Não foi possível criar a tarefa.')),
          });
        }
      }
    });
  }

  openQuickAdd(key: QuickAddKey): void {
    this.quickAdd[key].open = true;
  }

  cancelQuickAdd(key: QuickAddKey): void {
    this.quickAdd[key] = { open: false, title: '' };
  }

  submitQuickAdd(key: QuickAddKey, taskList: Task[], status: TaskStatus): void {
    const title = this.quickAdd[key].title.trim();
    if (!title) {
      return;
    }

    const newTask: Partial<Task> = { title, description: '', status, taskOrder: taskList.length };
    this.taskService.createTask(newTask).subscribe({
      next: () => {
        this.loadTasks();
        this.notificationService.success('Tarefa criada.');
        // Mantém o campo aberto e limpo para adicionar o próximo cartão rapidamente.
        this.quickAdd[key].title = '';
      },
      error: (err: unknown) =>
        this.notificationService.error(this.friendlyErrorMessage(err, 'Não foi possível criar a tarefa.')),
    });
  }

  deleteTask(task: Task): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      ...this.dialogConfig('360px'),
      data: {
        title: 'Confirmar Exclusão',
        message: `Tem certeza que deseja excluir a tarefa "${task.title}"?`,
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.taskService.deleteTask(task.id).subscribe({
          next: () => {
            this.loadTasks();
            this.notificationService.success('Tarefa excluída.');
          },
          error: (err: unknown) =>
            this.notificationService.error(this.friendlyErrorMessage(err, 'Não foi possível excluir a tarefa.')),
        });
      }
    });
  }
}
