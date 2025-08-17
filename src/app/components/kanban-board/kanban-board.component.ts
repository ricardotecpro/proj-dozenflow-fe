import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Observable, forkJoin, take } from 'rxjs';
import { Task, TaskStatus } from '../../models/task.model';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-kanban-board',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  templateUrl: './kanban-board.component.html',
  styleUrls: ['./kanban-board.component.scss'],
})
export class KanbanBoardComponent implements OnInit {
  todoTasks: Task[] = [];
  inProgressTasks: Task[] = [];
  doneTasks: Task[] = [];

  constructor(private taskService: TaskService) {}

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
}
