import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
import { KanbanBoardComponent } from './kanban-board.component';
import { TaskService } from '../../services/task.service';
import { Task, TaskStatus } from '../../models/task.model';

describe('KanbanBoardComponent', () => {
  let fixture: ComponentFixture<KanbanBoardComponent>;
  let component: KanbanBoardComponent;
  let taskServiceSpy: jasmine.SpyObj<TaskService>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;

  let tasks: Task[];

  beforeEach(() => {
    // Fresh array every test: KanbanBoardComponent.loadTasks() sorts the
    // array returned by getTasks() in place, so a shared array would leak
    // ordering between tests.
    tasks = [
      { id: 1, title: 'Todo 1', description: '', status: TaskStatus.A_FAZER, taskOrder: 1 },
      { id: 2, title: 'Todo 0', description: '', status: TaskStatus.A_FAZER, taskOrder: 0 },
      { id: 3, title: 'In progress', description: '', status: TaskStatus.EM_ANDAMENTO, taskOrder: 0 },
      { id: 4, title: 'Done', description: '', status: TaskStatus.CONCLUIDA, taskOrder: 0 },
    ];

    taskServiceSpy = jasmine.createSpyObj('TaskService', ['getTasks', 'createTask', 'updateTask', 'deleteTask']);
    taskServiceSpy.getTasks.and.returnValue(of(tasks));
    taskServiceSpy.updateTask.and.returnValue(of(tasks[0]));
    taskServiceSpy.createTask.and.returnValue(of(tasks[0]));
    taskServiceSpy.deleteTask.and.returnValue(of(undefined));

    dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

    TestBed.configureTestingModule({
      imports: [KanbanBoardComponent],
      providers: [
        { provide: TaskService, useValue: taskServiceSpy },
        { provide: MatDialog, useValue: dialogSpy },
      ],
    });

    fixture = TestBed.createComponent(KanbanBoardComponent);
    component = fixture.componentInstance;
  });

  it('loads and buckets tasks by status, ordered by taskOrder', () => {
    fixture.detectChanges(); // triggers ngOnInit -> loadTasks

    expect(component.todoTasks.map((t) => t.id)).toEqual([2, 1]);
    expect(component.inProgressTasks.map((t) => t.id)).toEqual([3]);
    expect(component.doneTasks.map((t) => t.id)).toEqual([4]);
  });

  it('deleteTask() deletes and reloads when the confirmation dialog resolves true', () => {
    fixture.detectChanges(); // loadTasks() sorts `tasks` in place, so look up by id afterwards
    const taskToDelete = tasks.find((t) => t.id === 1)!;
    dialogSpy.open.and.returnValue({ afterClosed: () => of(true) } as MatDialogRef<unknown>);

    component.deleteTask(taskToDelete);

    expect(taskServiceSpy.deleteTask).toHaveBeenCalledWith(1);
    expect(taskServiceSpy.getTasks).toHaveBeenCalledTimes(2); // initial load + reload after delete
  });

  it('deleteTask() does nothing when the confirmation dialog is dismissed', () => {
    fixture.detectChanges();
    const taskToDelete = tasks.find((t) => t.id === 1)!;
    dialogSpy.open.and.returnValue({ afterClosed: () => of(false) } as MatDialogRef<unknown>);

    component.deleteTask(taskToDelete);

    expect(taskServiceSpy.deleteTask).not.toHaveBeenCalled();
  });

  it('openTaskDialog() creates a new task with the target status and next order', () => {
    fixture.detectChanges();
    const newTask = { title: 'New', description: '' };
    dialogSpy.open.and.returnValue({ afterClosed: () => of(newTask) } as MatDialogRef<unknown>);

    component.openTaskDialog(undefined, component.todoTasks, TaskStatus.A_FAZER);

    expect(taskServiceSpy.createTask).toHaveBeenCalledWith(
      jasmine.objectContaining({ status: TaskStatus.A_FAZER, taskOrder: component.todoTasks.length }),
    );
  });

  it('openTaskDialog() updates an existing task when the result has an id', () => {
    fixture.detectChanges();
    const existingTask = tasks.find((t) => t.id === 1)!;
    const editedTask = { ...existingTask, title: 'Edited' };
    dialogSpy.open.and.returnValue({ afterClosed: () => of(editedTask) } as MatDialogRef<unknown>);

    component.openTaskDialog(existingTask);

    expect(taskServiceSpy.updateTask).toHaveBeenCalledWith(existingTask.id, editedTask);
  });
});
