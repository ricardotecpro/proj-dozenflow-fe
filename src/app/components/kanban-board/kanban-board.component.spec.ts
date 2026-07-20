import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { KanbanBoardComponent } from './kanban-board.component';
import { TaskService } from '../../services/task.service';
import { ListService } from '../../services/list.service';
import { NotificationService } from '../../services/notification.service';
import { Task } from '../../models/task.model';
import { TaskList } from '../../models/list.model';

function makeTask(overrides: Partial<Task> & Pick<Task, 'id' | 'title' | 'listId' | 'taskOrder'>): Task {
  return {
    description: '',
    archived: false,
    dueDate: null,
    coverColor: null,
    coverSize: null,
    coverAttachmentId: null,
    labels: [],
    checklistTotal: 0,
    checklistDone: 0,
    commentCount: 0,
    attachmentCount: 0,
    ...overrides,
  };
}

function makeList(overrides: Partial<TaskList> & Pick<TaskList, 'id' | 'name' | 'position'>): TaskList {
  return {
    archived: false,
    ...overrides,
  };
}

describe('KanbanBoardComponent', () => {
  let fixture: ComponentFixture<KanbanBoardComponent>;
  let component: KanbanBoardComponent;
  let taskServiceSpy: jasmine.SpyObj<TaskService>;
  let listServiceSpy: jasmine.SpyObj<ListService>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;
  let notificationServiceSpy: jasmine.SpyObj<NotificationService>;

  let tasks: Task[];
  let lists: TaskList[];

  beforeEach(() => {
    // Fresh arrays every test: loadBoard() sorts/groups in place, so shared
    // arrays would leak state between tests.
    lists = [
      makeList({ id: 1, name: 'A Fazer', position: 0 }),
      makeList({ id: 2, name: 'Em Andamento', position: 1 }),
      makeList({ id: 3, name: 'Concluída', position: 2 }),
    ];
    tasks = [
      makeTask({ id: 1, title: 'Todo 1', listId: 1, taskOrder: 1 }),
      makeTask({ id: 2, title: 'Todo 0', listId: 1, taskOrder: 0 }),
      makeTask({ id: 3, title: 'In progress', listId: 2, taskOrder: 0 }),
      makeTask({ id: 4, title: 'Done', listId: 3, taskOrder: 0 }),
    ];

    taskServiceSpy = jasmine.createSpyObj('TaskService', [
      'getTasks',
      'createTask',
      'updateTask',
      'deleteTask',
      'archiveTask',
    ]);
    taskServiceSpy.getTasks.and.returnValue(of(tasks));
    taskServiceSpy.updateTask.and.returnValue(of(tasks[0]));
    taskServiceSpy.createTask.and.returnValue(of(tasks[0]));
    taskServiceSpy.deleteTask.and.returnValue(of(undefined));
    taskServiceSpy.archiveTask.and.returnValue(of(tasks[0]));

    listServiceSpy = jasmine.createSpyObj('ListService', ['getLists', 'createList', 'updateList', 'archiveList']);
    listServiceSpy.getLists.and.returnValue(of(lists));
    listServiceSpy.createList.and.returnValue(of(lists[0]));
    listServiceSpy.updateList.and.returnValue(of(lists[0]));
    listServiceSpy.archiveList.and.returnValue(of(lists[0]));

    dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    notificationServiceSpy = jasmine.createSpyObj('NotificationService', ['success', 'error']);

    TestBed.configureTestingModule({
      imports: [KanbanBoardComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: TaskService, useValue: taskServiceSpy },
        { provide: ListService, useValue: listServiceSpy },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: NotificationService, useValue: notificationServiceSpy },
      ],
    });

    fixture = TestBed.createComponent(KanbanBoardComponent);
    component = fixture.componentInstance;
  });

  it('starts with loading true and clears it once the board loads', () => {
    expect(component.loading).toBeTrue();

    fixture.detectChanges(); // triggers ngOnInit -> loadBoard

    expect(component.loading).toBeFalse();
  });

  it('loads lists ordered by position and buckets tasks by listId, ordered by taskOrder', () => {
    fixture.detectChanges();

    expect(component.lists.map((l) => l.id)).toEqual([1, 2, 3]);
    expect(component.tasksByListId[1].map((t) => t.id)).toEqual([2, 1]);
    expect(component.tasksByListId[2].map((t) => t.id)).toEqual([3]);
    expect(component.tasksByListId[3].map((t) => t.id)).toEqual([4]);
  });

  it('loadBoard() clears loading and notifies on error', () => {
    taskServiceSpy.getTasks.and.returnValue(throwError(() => new Error('boom')));

    fixture.detectChanges();

    expect(component.loading).toBeFalse();
    expect(notificationServiceSpy.error).toHaveBeenCalledWith('Não foi possível carregar o board.');
  });

  it('loadBoard() shows a cold-start-friendly message on a 504', () => {
    taskServiceSpy.getTasks.and.returnValue(throwError(() => new HttpErrorResponse({ status: 504 })));

    fixture.detectChanges();

    expect(notificationServiceSpy.error).toHaveBeenCalledWith(
      'O servidor está iniciando, tente novamente em alguns segundos.',
    );
  });

  it('archiveTask() archives, removes the card locally and notifies success when the confirmation dialog resolves true', () => {
    fixture.detectChanges();
    const taskToArchive = tasks.find((t) => t.id === 1)!;
    dialogSpy.open.and.returnValue({ afterClosed: () => of(true) } as MatDialogRef<unknown>);

    component.archiveTask(taskToArchive);

    expect(taskServiceSpy.archiveTask).toHaveBeenCalledWith(1);
    expect(component.tasksByListId[1].map((t) => t.id)).toEqual([2]);
    expect(notificationServiceSpy.success).toHaveBeenCalledWith('Cartão arquivado.');
  });

  it('archiveTask() does nothing when the confirmation dialog is dismissed', () => {
    fixture.detectChanges();
    const taskToArchive = tasks.find((t) => t.id === 1)!;
    dialogSpy.open.and.returnValue({ afterClosed: () => of(false) } as MatDialogRef<unknown>);

    component.archiveTask(taskToArchive);

    expect(taskServiceSpy.archiveTask).not.toHaveBeenCalled();
  });

  it('archiveTask() notifies an error when the archive request fails', () => {
    fixture.detectChanges();
    const taskToArchive = tasks.find((t) => t.id === 1)!;
    dialogSpy.open.and.returnValue({ afterClosed: () => of(true) } as MatDialogRef<unknown>);
    taskServiceSpy.archiveTask.and.returnValue(throwError(() => new Error('boom')));

    component.archiveTask(taskToArchive);

    expect(notificationServiceSpy.error).toHaveBeenCalledWith('Não foi possível arquivar o cartão.');
  });

  it('openTaskDialog() creates a new task with the target list, next order, and notifies success', () => {
    fixture.detectChanges();
    const newTask = { title: 'New', description: '' };
    dialogSpy.open.and.returnValue({ afterClosed: () => of(newTask) } as MatDialogRef<unknown>);

    component.openTaskDialog(undefined, component.tasksByListId[1], 1);

    expect(taskServiceSpy.createTask).toHaveBeenCalledWith(
      jasmine.objectContaining({ listId: 1, taskOrder: component.tasksByListId[1].length }),
    );
    expect(notificationServiceSpy.success).toHaveBeenCalledWith('Tarefa criada.');
  });

  it('openTaskDialog() notifies an error when creating a task fails', () => {
    fixture.detectChanges();
    const newTask = { title: 'New', description: '' };
    dialogSpy.open.and.returnValue({ afterClosed: () => of(newTask) } as MatDialogRef<unknown>);
    taskServiceSpy.createTask.and.returnValue(throwError(() => new Error('boom')));

    component.openTaskDialog(undefined, component.tasksByListId[1], 1);

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

  it('openTaskDialog() reloads the board when an existing task dialog is cancelled (labels/checklist may have changed)', () => {
    fixture.detectChanges();
    const existingTask = tasks.find((t) => t.id === 1)!;
    dialogSpy.open.and.returnValue({ afterClosed: () => of(undefined) } as MatDialogRef<unknown>);
    taskServiceSpy.getTasks.calls.reset();

    component.openTaskDialog(existingTask);

    expect(taskServiceSpy.getTasks).toHaveBeenCalled();
  });

  it('openTaskDialog() does not reload the board when a new task dialog is cancelled', () => {
    fixture.detectChanges();
    dialogSpy.open.and.returnValue({ afterClosed: () => of(undefined) } as MatDialogRef<unknown>);
    taskServiceSpy.getTasks.calls.reset();

    component.openTaskDialog(undefined, component.tasksByListId[1], 1);

    expect(taskServiceSpy.getTasks).not.toHaveBeenCalled();
  });

  it('openQuickAdd() opens the field and cancelQuickAdd() resets it', () => {
    fixture.detectChanges();

    component.openQuickAdd(1);
    expect(component.quickAdd[1].open).toBeTrue();

    component.quickAdd[1].title = 'Rascunho';
    component.cancelQuickAdd(1);

    expect(component.quickAdd[1].open).toBeFalse();
    expect(component.quickAdd[1].title).toBe('');
  });

  it('submitQuickAdd() does nothing for a blank title', () => {
    fixture.detectChanges();
    component.quickAdd[1].title = '   ';

    component.submitQuickAdd(1, component.tasksByListId[1]);

    expect(taskServiceSpy.createTask).not.toHaveBeenCalled();
  });

  it('submitQuickAdd() creates the task, notifies success and clears the title but keeps the field open', () => {
    fixture.detectChanges();
    component.quickAdd[1].open = true;
    component.quickAdd[1].title = 'Cartão rápido';

    component.submitQuickAdd(1, component.tasksByListId[1]);

    expect(taskServiceSpy.createTask).toHaveBeenCalledWith(
      jasmine.objectContaining({ title: 'Cartão rápido', listId: 1 }),
    );
    expect(notificationServiceSpy.success).toHaveBeenCalledWith('Tarefa criada.');
    expect(component.quickAdd[1].title).toBe('');
    expect(component.quickAdd[1].open).toBeTrue();
  });

  it('submitQuickAdd() notifies an error when creation fails', () => {
    fixture.detectChanges();
    component.quickAdd[2].title = 'Cartão rápido';
    taskServiceSpy.createTask.and.returnValue(throwError(() => new Error('boom')));

    component.submitQuickAdd(2, component.tasksByListId[2]);

    expect(notificationServiceSpy.error).toHaveBeenCalledWith('Não foi possível criar a tarefa.');
  });

  it('addList() opens the field and submitAddList() creates the list, appending it locally', () => {
    fixture.detectChanges();
    const created: TaskList = makeList({ id: 9, name: 'Backlog', position: 3 });
    listServiceSpy.createList.and.returnValue(of(created));

    component.addList();
    expect(component.newList.open).toBeTrue();

    component.newList.title = 'Backlog';
    component.submitAddList();

    expect(listServiceSpy.createList).toHaveBeenCalledWith({ name: 'Backlog', position: 3 });
    expect(component.lists.map((l) => l.id)).toEqual([1, 2, 3, 9]);
    expect(component.tasksByListId[9]).toEqual([]);
    expect(component.newList.open).toBeFalse();
    expect(notificationServiceSpy.success).toHaveBeenCalledWith('Lista criada.');
  });

  it('submitAddList() does nothing for a blank name', () => {
    fixture.detectChanges();
    component.newList.title = '   ';

    component.submitAddList();

    expect(listServiceSpy.createList).not.toHaveBeenCalled();
  });

  it('submitAddList() notifies an error when creation fails', () => {
    fixture.detectChanges();
    component.newList.title = 'Backlog';
    listServiceSpy.createList.and.returnValue(throwError(() => new Error('boom')));

    component.submitAddList();

    expect(notificationServiceSpy.error).toHaveBeenCalledWith('Não foi possível criar a lista.');
  });

  it('startRenameList()/cancelRenameList() toggle inline-edit state', () => {
    fixture.detectChanges();
    const list = component.lists[0];

    component.startRenameList(list);
    expect(component.editingListId).toBe(list.id);
    expect(component.editingListName).toBe(list.name);

    component.cancelRenameList();
    expect(component.editingListId).toBeNull();
  });

  it('commitRenameList() renames the list and notifies success', () => {
    fixture.detectChanges();
    const list = component.lists[0];
    listServiceSpy.updateList.and.returnValue(of({ ...list, name: 'Renamed' }));
    component.startRenameList(list);
    component.editingListName = 'Renamed';

    component.commitRenameList(list);

    expect(listServiceSpy.updateList).toHaveBeenCalledWith(list.id, { name: 'Renamed', position: list.position });
    expect(list.name).toBe('Renamed');
    expect(component.editingListId).toBeNull();
    expect(notificationServiceSpy.success).toHaveBeenCalledWith('Lista renomeada.');
  });

  it('commitRenameList() does not call the API when the name is unchanged or blank', () => {
    fixture.detectChanges();
    const list = component.lists[0];
    component.startRenameList(list);
    component.editingListName = list.name;

    component.commitRenameList(list);

    expect(listServiceSpy.updateList).not.toHaveBeenCalled();
  });

  it('archiveList() archives, removes the list locally and notifies success when confirmed', () => {
    fixture.detectChanges();
    const list = component.lists[0];
    dialogSpy.open.and.returnValue({ afterClosed: () => of(true) } as MatDialogRef<unknown>);

    component.archiveList(list);

    expect(listServiceSpy.archiveList).toHaveBeenCalledWith(list.id);
    expect(component.lists.map((l) => l.id)).toEqual([2, 3]);
    expect(component.tasksByListId[list.id]).toBeUndefined();
    expect(notificationServiceSpy.success).toHaveBeenCalledWith('Lista arquivada.');
  });

  it('archiveList() does nothing when the confirmation dialog is dismissed', () => {
    fixture.detectChanges();
    const list = component.lists[0];
    dialogSpy.open.and.returnValue({ afterClosed: () => of(false) } as MatDialogRef<unknown>);

    component.archiveList(list);

    expect(listServiceSpy.archiveList).not.toHaveBeenCalled();
  });

  it('archiveList() refuses to archive the last remaining list, without opening a dialog', () => {
    fixture.detectChanges();
    component.lists = [component.lists[0]];

    component.archiveList(component.lists[0]);

    expect(dialogSpy.open).not.toHaveBeenCalled();
    expect(listServiceSpy.archiveList).not.toHaveBeenCalled();
  });

  it('archiveList() notifies an error when the archive request fails', () => {
    fixture.detectChanges();
    const list = component.lists[0];
    dialogSpy.open.and.returnValue({ afterClosed: () => of(true) } as MatDialogRef<unknown>);
    listServiceSpy.archiveList.and.returnValue(throwError(() => new Error('boom')));

    component.archiveList(list);

    expect(notificationServiceSpy.error).toHaveBeenCalledWith('Não foi possível arquivar a lista.');
  });

  it('dropList() reorders the lists array and persists the new positions for every list', () => {
    fixture.detectChanges();

    component.dropList({ previousIndex: 0, currentIndex: 2 } as never);

    expect(component.lists.map((l) => l.id)).toEqual([2, 3, 1]);
    expect(listServiceSpy.updateList).toHaveBeenCalledWith(2, { name: 'Em Andamento', position: 0 });
    expect(listServiceSpy.updateList).toHaveBeenCalledWith(3, { name: 'Concluída', position: 1 });
    expect(listServiceSpy.updateList).toHaveBeenCalledWith(1, { name: 'A Fazer', position: 2 });
  });

  it('dropList() reloads the board and notifies an error when persisting positions fails', () => {
    fixture.detectChanges();
    listServiceSpy.updateList.and.returnValue(throwError(() => new Error('boom')));
    taskServiceSpy.getTasks.calls.reset();

    component.dropList({ previousIndex: 0, currentIndex: 2 } as never);

    expect(notificationServiceSpy.error).toHaveBeenCalledWith(
      'Não foi possível mover a lista. Desfazendo a alteração.',
    );
    expect(taskServiceSpy.getTasks).toHaveBeenCalled();
  });
});
