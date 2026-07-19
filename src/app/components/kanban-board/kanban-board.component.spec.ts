import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { KanbanBoardComponent } from './kanban-board.component';
import { TaskService } from '../../services/task.service';
import { NotificationService } from '../../services/notification.service';
import { Task, TaskStatus } from '../../models/task.model';

function makeTask(overrides: Partial<Task> & Pick<Task, 'id' | 'title' | 'status' | 'taskOrder'>): Task {
  return {
    description: '',
    dueDate: null,
    labels: [],
    checklistTotal: 0,
    checklistDone: 0,
    ...overrides,
  };
}

describe('KanbanBoardComponent', () => {
  let fixture: ComponentFixture<KanbanBoardComponent>;
  let component: KanbanBoardComponent;
  let taskServiceSpy: jasmine.SpyObj<TaskService>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;
  let notificationServiceSpy: jasmine.SpyObj<NotificationService>;

  let tasks: Task[];

  beforeEach(() => {
    // Fresh array every test: KanbanBoardComponent.loadTasks() sorts the
    // array returned by getTasks() in place, so a shared array would leak
    // ordering between tests.
    tasks = [
      makeTask({ id: 1, title: 'Todo 1', status: TaskStatus.A_FAZER, taskOrder: 1 }),
      makeTask({ id: 2, title: 'Todo 0', status: TaskStatus.A_FAZER, taskOrder: 0 }),
      makeTask({ id: 3, title: 'In progress', status: TaskStatus.EM_ANDAMENTO, taskOrder: 0 }),
      makeTask({ id: 4, title: 'Done', status: TaskStatus.CONCLUIDA, taskOrder: 0 }),
    ];

    taskServiceSpy = jasmine.createSpyObj('TaskService', ['getTasks', 'createTask', 'updateTask', 'deleteTask']);
    taskServiceSpy.getTasks.and.returnValue(of(tasks));
    taskServiceSpy.updateTask.and.returnValue(of(tasks[0]));
    taskServiceSpy.createTask.and.returnValue(of(tasks[0]));
    taskServiceSpy.deleteTask.and.returnValue(of(undefined));

    dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    notificationServiceSpy = jasmine.createSpyObj('NotificationService', ['success', 'error']);

    TestBed.configureTestingModule({
      imports: [KanbanBoardComponent],
      providers: [
        { provide: TaskService, useValue: taskServiceSpy },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: NotificationService, useValue: notificationServiceSpy },
      ],
    });

    fixture = TestBed.createComponent(KanbanBoardComponent);
    component = fixture.componentInstance;
  });

  it('starts with loading true and clears it once tasks load', () => {
    expect(component.loading).toBeTrue();

    fixture.detectChanges(); // triggers ngOnInit -> loadTasks

    expect(component.loading).toBeFalse();
  });

  it('loads and buckets tasks by status, ordered by taskOrder', () => {
    fixture.detectChanges();

    expect(component.todoTasks.map((t) => t.id)).toEqual([2, 1]);
    expect(component.inProgressTasks.map((t) => t.id)).toEqual([3]);
    expect(component.doneTasks.map((t) => t.id)).toEqual([4]);
  });

  it('loadTasks() clears loading and notifies on error', () => {
    taskServiceSpy.getTasks.and.returnValue(throwError(() => new Error('boom')));

    fixture.detectChanges();

    expect(component.loading).toBeFalse();
    expect(notificationServiceSpy.error).toHaveBeenCalledWith('Não foi possível carregar as tarefas.');
  });

  it('loadTasks() shows a cold-start-friendly message on a 504', () => {
    taskServiceSpy.getTasks.and.returnValue(throwError(() => new HttpErrorResponse({ status: 504 })));

    fixture.detectChanges();

    expect(notificationServiceSpy.error).toHaveBeenCalledWith(
      'O servidor está iniciando, tente novamente em alguns segundos.',
    );
  });

  it('deleteTask() deletes, reloads and notifies success when the confirmation dialog resolves true', () => {
    fixture.detectChanges(); // loadTasks() sorts `tasks` in place, so look up by id afterwards
    const taskToDelete = tasks.find((t) => t.id === 1)!;
    dialogSpy.open.and.returnValue({ afterClosed: () => of(true) } as MatDialogRef<unknown>);

    component.deleteTask(taskToDelete);

    expect(taskServiceSpy.deleteTask).toHaveBeenCalledWith(1);
    expect(taskServiceSpy.getTasks).toHaveBeenCalledTimes(2); // initial load + reload after delete
    expect(notificationServiceSpy.success).toHaveBeenCalledWith('Tarefa excluída.');
  });

  it('deleteTask() does nothing when the confirmation dialog is dismissed', () => {
    fixture.detectChanges();
    const taskToDelete = tasks.find((t) => t.id === 1)!;
    dialogSpy.open.and.returnValue({ afterClosed: () => of(false) } as MatDialogRef<unknown>);

    component.deleteTask(taskToDelete);

    expect(taskServiceSpy.deleteTask).not.toHaveBeenCalled();
  });

  it('deleteTask() notifies an error when the delete request fails', () => {
    fixture.detectChanges();
    const taskToDelete = tasks.find((t) => t.id === 1)!;
    dialogSpy.open.and.returnValue({ afterClosed: () => of(true) } as MatDialogRef<unknown>);
    taskServiceSpy.deleteTask.and.returnValue(throwError(() => new Error('boom')));

    component.deleteTask(taskToDelete);

    expect(notificationServiceSpy.error).toHaveBeenCalledWith('Não foi possível excluir a tarefa.');
  });

  it('openTaskDialog() creates a new task with the target status, next order, and notifies success', () => {
    fixture.detectChanges();
    const newTask = { title: 'New', description: '' };
    dialogSpy.open.and.returnValue({ afterClosed: () => of(newTask) } as MatDialogRef<unknown>);

    component.openTaskDialog(undefined, component.todoTasks, TaskStatus.A_FAZER);

    expect(taskServiceSpy.createTask).toHaveBeenCalledWith(
      jasmine.objectContaining({ status: TaskStatus.A_FAZER, taskOrder: component.todoTasks.length }),
    );
    expect(notificationServiceSpy.success).toHaveBeenCalledWith('Tarefa criada.');
  });

  it('openTaskDialog() notifies an error when creating a task fails', () => {
    fixture.detectChanges();
    const newTask = { title: 'New', description: '' };
    dialogSpy.open.and.returnValue({ afterClosed: () => of(newTask) } as MatDialogRef<unknown>);
    taskServiceSpy.createTask.and.returnValue(throwError(() => new Error('boom')));

    component.openTaskDialog(undefined, component.todoTasks, TaskStatus.A_FAZER);

    expect(notificationServiceSpy.error).toHaveBeenCalledWith('Não foi possível criar a tarefa.');
  });

  it('openTaskDialog() updates an existing task when the result has an id, and notifies success', () => {
    fixture.detectChanges();
    const existingTask = tasks.find((t) => t.id === 1)!;
    const editedTask = { ...existingTask, title: 'Edited' };
    dialogSpy.open.and.returnValue({ afterClosed: () => of(editedTask) } as MatDialogRef<unknown>);

    component.openTaskDialog(existingTask);

    expect(taskServiceSpy.updateTask).toHaveBeenCalledWith(existingTask.id, editedTask);
    expect(notificationServiceSpy.success).toHaveBeenCalledWith('Tarefa atualizada.');
  });

  it('openTaskDialog() notifies an error when updating a task fails', () => {
    fixture.detectChanges();
    const existingTask = tasks.find((t) => t.id === 1)!;
    const editedTask = { ...existingTask, title: 'Edited' };
    dialogSpy.open.and.returnValue({ afterClosed: () => of(editedTask) } as MatDialogRef<unknown>);
    taskServiceSpy.updateTask.and.returnValue(throwError(() => new Error('boom')));

    component.openTaskDialog(existingTask);

    expect(notificationServiceSpy.error).toHaveBeenCalledWith('Não foi possível atualizar a tarefa.');
  });

  it('openTaskDialog() reloads tasks when an existing task dialog is cancelled (labels/checklist may have changed)', () => {
    fixture.detectChanges();
    const existingTask = tasks.find((t) => t.id === 1)!;
    dialogSpy.open.and.returnValue({ afterClosed: () => of(undefined) } as MatDialogRef<unknown>);
    taskServiceSpy.getTasks.calls.reset();

    component.openTaskDialog(existingTask);

    expect(taskServiceSpy.getTasks).toHaveBeenCalled();
  });

  it('openTaskDialog() does not reload tasks when a new task dialog is cancelled', () => {
    fixture.detectChanges();
    dialogSpy.open.and.returnValue({ afterClosed: () => of(undefined) } as MatDialogRef<unknown>);
    taskServiceSpy.getTasks.calls.reset();

    component.openTaskDialog(undefined, component.todoTasks, TaskStatus.A_FAZER);

    expect(taskServiceSpy.getTasks).not.toHaveBeenCalled();
  });

  it('openQuickAdd() opens the field and cancelQuickAdd() resets it', () => {
    fixture.detectChanges();

    component.openQuickAdd('todo');
    expect(component.quickAdd.todo.open).toBeTrue();

    component.quickAdd.todo.title = 'Rascunho';
    component.cancelQuickAdd('todo');

    expect(component.quickAdd.todo.open).toBeFalse();
    expect(component.quickAdd.todo.title).toBe('');
  });

  it('submitQuickAdd() does nothing for a blank title', () => {
    fixture.detectChanges();
    component.quickAdd.todo.title = '   ';

    component.submitQuickAdd('todo', component.todoTasks, TaskStatus.A_FAZER);

    expect(taskServiceSpy.createTask).not.toHaveBeenCalled();
  });

  it('submitQuickAdd() creates the task, notifies success and clears the title but keeps the field open', () => {
    fixture.detectChanges();
    component.quickAdd.todo.open = true;
    component.quickAdd.todo.title = 'Cartão rápido';

    component.submitQuickAdd('todo', component.todoTasks, TaskStatus.A_FAZER);

    expect(taskServiceSpy.createTask).toHaveBeenCalledWith(
      jasmine.objectContaining({ title: 'Cartão rápido', status: TaskStatus.A_FAZER }),
    );
    expect(notificationServiceSpy.success).toHaveBeenCalledWith('Tarefa criada.');
    expect(component.quickAdd.todo.title).toBe('');
    expect(component.quickAdd.todo.open).toBeTrue();
  });

  it('submitQuickAdd() notifies an error when creation fails', () => {
    fixture.detectChanges();
    component.quickAdd.inProgress.title = 'Cartão rápido';
    taskServiceSpy.createTask.and.returnValue(throwError(() => new Error('boom')));

    component.submitQuickAdd('inProgress', component.inProgressTasks, TaskStatus.EM_ANDAMENTO);

    expect(notificationServiceSpy.error).toHaveBeenCalledWith('Não foi possível criar a tarefa.');
  });
});
