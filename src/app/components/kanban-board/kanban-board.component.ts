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
import { Task } from '../../models/task.model';
import { TaskList } from '../../models/list.model';
import { TaskService } from '../../services/task.service';
import { ListService } from '../../services/list.service';
import { NotificationService } from '../../services/notification.service';
import { TaskDialogComponent, TaskDialogData } from '../task-dialog/task-dialog.component';
import { TaskCardComponent } from '../task-card/task-card.component';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { ArchivePanelComponent } from '../archive-panel/archive-panel.component';

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
  lists: TaskList[] = [];
  tasksByListId: Record<number, Task[]> = {};
  loading = true;

  // Adição rápida de cartão (só título, estilo Trello), disponível em toda lista.
  quickAdd: Record<number, { open: boolean; title: string }> = {};

  // Afordância "+ Adicionar outra lista" no fim do board, estilo Trello.
  newList: { open: boolean; title: string } = { open: false, title: '' };

  // Edição inline do título da lista (clicar no título vira um input).
  editingListId: number | null = null;
  editingListName = '';

  constructor(
    private taskService: TaskService,
    private listService: ListService,
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
    this.loadBoard();
  }

  /** Ids de todas as colunas de cartões, no formato usado pelos cdkDropList — conecta as listas entre si para drag-and-drop de cartões. */
  get taskListIds(): string[] {
    return this.lists.map((list) => 'taskList-' + list.id);
  }

  loadBoard(): void {
    this.loading = true;
    forkJoin([this.listService.getLists(), this.taskService.getTasks()]).subscribe({
      next: ([lists, tasks]) => {
        this.lists = [...lists].sort((a, b) => a.position - b.position);
        const sortedTasks = tasks.sort((a, b) => a.taskOrder - b.taskOrder);

        this.tasksByListId = {};
        const quickAdd: Record<number, { open: boolean; title: string }> = {};
        for (const list of this.lists) {
          this.tasksByListId[list.id] = sortedTasks.filter((t: Task) => t.listId === list.id);
          quickAdd[list.id] = this.quickAdd[list.id] ?? { open: false, title: '' };
        }
        this.quickAdd = quickAdd;

        this.loading = false;
      },
      error: (err: unknown) => {
        this.loading = false;
        this.notificationService.error(this.friendlyErrorMessage(err, 'Não foi possível carregar o board.'));
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

      // Atualiza a ordem e a lista de ambos os containers.
      const newListId = this.getListIdFromContainerId(event.container.id);
      if (newListId === null) return; // Guarda de segurança, não deve acontecer com IDs corretos.

      this.updateListOrder(event.container.data, newListId);
      this.updateListOrder(event.previousContainer.data);
    }
  }

  private updateListOrder(tasks: Task[], listId?: number): void {
    const updates: Observable<Task>[] = tasks.map((task, index) => {
      const updatedTask: Partial<Task> = {
        ...task,
        taskOrder: index,
      };
      if (listId !== undefined) {
        updatedTask.listId = listId;
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
            // Rollback simples: recarrega o board do servidor para garantir consistência.
            this.loadBoard();
          },
        });
    }
  }

  private getListIdFromContainerId(containerId: string): number | null {
    if (!containerId.startsWith('taskList-')) {
      return null;
    }
    const id = Number(containerId.slice('taskList-'.length));
    return Number.isNaN(id) ? null : id;
  }

  openTaskDialog(task?: Task, taskList?: Task[], listId?: number): void {
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
        // Labels/checklist mudam direto contra a API a partir do diálogo,
        // fora do fluxo de salvar/cancelar — mesmo em "Cancelar", recarrega
        // pra refletir qualquer mudança desse tipo que já foi persistida.
        if (!isNew) {
          this.loadBoard();
        }
        return;
      }

      if (result.id) {
        // Atualiza uma tarefa existente
        this.taskService.updateTask(result.id, result).subscribe({
          next: () => {
            this.loadBoard();
            this.notificationService.success('Tarefa atualizada.');
          },
          error: (err: unknown) =>
            this.notificationService.error(this.friendlyErrorMessage(err, 'Não foi possível atualizar a tarefa.')),
        });
      } else {
        // Cria uma nova tarefa, garantindo que tenha lista e ordem
        if (listId !== undefined && taskList) {
          const newTask: Partial<Task> = {
            ...result,
            listId,
            taskOrder: taskList.length, // Adiciona a nova tarefa no final da lista
          };
          this.taskService.createTask(newTask).subscribe({
            next: () => {
              this.loadBoard();
              this.notificationService.success('Tarefa criada.');
            },
            error: (err: unknown) =>
              this.notificationService.error(this.friendlyErrorMessage(err, 'Não foi possível criar a tarefa.')),
          });
        }
      }
    });
  }

  openQuickAdd(listId: number): void {
    this.quickAdd[listId].open = true;
  }

  cancelQuickAdd(listId: number): void {
    this.quickAdd[listId] = { open: false, title: '' };
  }

  submitQuickAdd(listId: number, taskList: Task[]): void {
    const title = this.quickAdd[listId].title.trim();
    if (!title) {
      return;
    }

    const newTask: Partial<Task> = { title, description: '', listId, taskOrder: taskList.length };
    this.taskService.createTask(newTask).subscribe({
      next: () => {
        this.loadBoard();
        this.notificationService.success('Tarefa criada.');
        // Mantém o campo aberto e limpo para adicionar o próximo cartão rapidamente.
        this.quickAdd[listId].title = '';
      },
      error: (err: unknown) =>
        this.notificationService.error(this.friendlyErrorMessage(err, 'Não foi possível criar a tarefa.')),
    });
  }

  /** Menu "..." da lista (estilo Trello): ordenar cartões da coluna in-place. */
  sortList(taskList: Task[], listId: number, by: 'title' | 'dueDate'): void {
    const sorted = [...taskList].sort((a, b) => {
      if (by === 'title') {
        return a.title.localeCompare(b.title, 'pt-BR');
      }
      // Sem data de vencimento vai para o final.
      if (!a.dueDate) return !b.dueDate ? 0 : 1;
      if (!b.dueDate) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    });
    taskList.splice(0, taskList.length, ...sorted);
    this.updateListOrder(taskList, listId);
  }

  archiveTask(task: Task): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      ...this.dialogConfig('360px'),
      data: {
        title: 'Arquivar cartão',
        message: `Tem certeza que deseja arquivar o cartão "${task.title}"?`,
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) {
        return;
      }
      this.taskService.archiveTask(task.id).subscribe({
        next: () => {
          const taskList = this.tasksByListId[task.listId];
          if (taskList) {
            const index = taskList.findIndex((t) => t.id === task.id);
            if (index !== -1) {
              taskList.splice(index, 1);
            }
          }
          this.notificationService.success('Cartão arquivado.');
        },
        error: (err: unknown) =>
          this.notificationService.error(this.friendlyErrorMessage(err, 'Não foi possível arquivar o cartão.')),
      });
    });
  }

  addList(): void {
    this.newList.open = true;
  }

  cancelAddList(): void {
    this.newList = { open: false, title: '' };
  }

  submitAddList(): void {
    const name = this.newList.title.trim();
    if (!name) {
      return;
    }

    this.listService.createList({ name, position: this.lists.length }).subscribe({
      next: (list) => {
        this.lists.push(list);
        this.tasksByListId[list.id] = [];
        this.quickAdd[list.id] = { open: false, title: '' };
        this.newList = { open: false, title: '' };
        this.notificationService.success('Lista criada.');
      },
      error: (err: unknown) =>
        this.notificationService.error(this.friendlyErrorMessage(err, 'Não foi possível criar a lista.')),
    });
  }

  startRenameList(list: TaskList): void {
    this.editingListId = list.id;
    this.editingListName = list.name;
  }

  cancelRenameList(): void {
    this.editingListId = null;
    this.editingListName = '';
  }

  commitRenameList(list: TaskList): void {
    const name = this.editingListName.trim();
    this.editingListId = null;
    if (!name || name === list.name) {
      return;
    }

    this.listService.updateList(list.id, { name, position: list.position }).subscribe({
      next: (updated) => {
        list.name = updated.name;
        this.notificationService.success('Lista renomeada.');
      },
      error: (err: unknown) => {
        this.notificationService.error(this.friendlyErrorMessage(err, 'Não foi possível renomear a lista.'));
      },
    });
  }

  archiveList(list: TaskList): void {
    if (this.lists.length <= 1) {
      return;
    }

    const cardCount = (this.tasksByListId[list.id] ?? []).length;
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      ...this.dialogConfig('360px'),
      data: {
        title: 'Arquivar lista',
        message: `Tem certeza que deseja arquivar a lista "${list.name}"? ${cardCount} cartão(ões) desta lista também serão arquivados.`,
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) {
        return;
      }
      this.listService.archiveList(list.id).subscribe({
        next: () => {
          this.lists = this.lists.filter((l) => l.id !== list.id);
          delete this.tasksByListId[list.id];
          delete this.quickAdd[list.id];
          this.notificationService.success('Lista arquivada.');
        },
        error: (err: unknown) =>
          this.notificationService.error(this.friendlyErrorMessage(err, 'Não foi possível arquivar a lista.')),
      });
    });
  }

  dropList(event: CdkDragDrop<TaskList[]>): void {
    moveItemInArray(this.lists, event.previousIndex, event.currentIndex);
    this.updateListPositions(this.lists);
  }

  private updateListPositions(lists: TaskList[]): void {
    const updates = lists.map((list, index) =>
      this.listService.updateList(list.id, { name: list.name, position: index }),
    );

    if (updates.length > 0) {
      forkJoin(updates)
        .pipe(take(1))
        .subscribe({
          error: (err: unknown) => {
            this.notificationService.error(
              this.friendlyErrorMessage(err, 'Não foi possível mover a lista. Desfazendo a alteração.'),
            );
            this.loadBoard();
          },
        });
    }
  }

  openArchivePanel(): void {
    const dialogRef = this.dialog.open(ArchivePanelComponent, this.dialogConfig('600px'));

    dialogRef.afterClosed().subscribe(() => {
      this.loadBoard();
    });
  }
}
