import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { MatDialog } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Observable, forkJoin, take } from 'rxjs';
import { Task, TaskStatus } from '../../models/task.model';
import { TaskService } from '../../services/task.service';
import { TaskDialogComponent, TaskDialogData } from '../task-dialog/task-dialog.component';

@Component({
  selector: 'app-kanban-board',
  standalone: true,
  imports: [CommonModule, DragDropModule, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './kanban-board.component.html',
  styleUrls: ['./kanban-board.component.scss'],
})
export class KanbanBoardComponent implements OnInit {
  todoTasks: Task[] = [];
  inProgressTasks: Task[] = [];
  doneTasks: Task[] = [];
  public TaskStatus = TaskStatus; // Torna o enum acessível para o template

  constructor(
    private taskService: TaskService,
    public dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.taskService.getTasks().subscribe((tasks) => {
      // Garante que a ordem seja consistente com o backend
      const sortedTasks = tasks.sort((a, b) => a.taskOrder - b.taskOrder);

      this.todoTasks = sortedTasks.filter((t: Task) => t.status === TaskStatus.A_FAZER);
      this.inProgressTasks = sortedTasks.filter((t: Task) => t.status === TaskStatus.EM_ANDAMENTO);
      this.doneTasks = sortedTasks.filter((t: Task) => t.status === TaskStatus.CONCLUIDA);
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
          next: () => console.log('Ordens das tarefas atualizadas com sucesso.'),
          error: (err: unknown) => {
            console.error('Falha ao atualizar as tarefas, revertendo a UI.', err);
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
      width: '400px',
      data: dialogData,
    });

    dialogRef.afterClosed().subscribe((result: Partial<Task> | undefined) => {
      if (!result) {
        return;
      }

      if (result.id) {
        // Atualiza uma tarefa existente
        this.taskService.updateTask(result.id, result).subscribe(() => this.loadTasks());
      } else {
        // Cria uma nova tarefa, garantindo que tenha status e ordem
        if (status && taskList) {
          const newTask: Partial<Task> = {
            ...result,
            status: status,
            taskOrder: taskList.length, // Adiciona a nova tarefa no final da lista
          };
          this.taskService.createTask(newTask).subscribe(() => this.loadTasks());
        }
      }
    });
  }

  deleteTask(task: Task): void {
    if (confirm(`Tem certeza que deseja excluir a tarefa "${task.title}"?`)) {
      this.taskService.deleteTask(task.id).subscribe({
        next: () => this.loadTasks(),
        error: (err) => console.error('Falha ao excluir a tarefa', err),
      });
    }
  }
}
