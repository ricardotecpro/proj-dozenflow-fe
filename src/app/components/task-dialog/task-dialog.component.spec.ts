import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { provideNativeDateAdapter } from '@angular/material/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TaskDialogComponent, TaskDialogData } from './task-dialog.component';
import { TaskStatus } from '../../models/task.model';

describe('TaskDialogComponent', () => {
  let fixture: ComponentFixture<TaskDialogComponent>;
  let component: TaskDialogComponent;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<TaskDialogComponent>>;

  function setup(data: TaskDialogData) {
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    TestBed.configureTestingModule({
      imports: [TaskDialogComponent],
      providers: [
        provideNativeDateAdapter(),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: data },
      ],
    });

    fixture = TestBed.createComponent(TaskDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('shows "Nova Tarefa" for a task without id', () => {
    setup({
      task: { title: '', description: '', status: TaskStatus.A_FAZER, taskOrder: 0, dueDate: null },
      enableDelete: false,
    });

    const title = fixture.debugElement.query(By.css('h2')).nativeElement.textContent as string;
    expect(title).toContain('Nova Tarefa');
  });

  it('shows "Editar Tarefa" for a task with id', () => {
    setup({
      task: {
        id: 1,
        title: 'Existing',
        description: '',
        status: TaskStatus.A_FAZER,
        taskOrder: 0,
        dueDate: null,
        labels: [],
      },
      enableDelete: true,
    });

    const title = fixture.debugElement.query(By.css('h2')).nativeElement.textContent as string;
    expect(title).toContain('Editar Tarefa');
  });

  it('cancel() closes the dialog', () => {
    setup({
      task: { title: '', description: '', status: TaskStatus.A_FAZER, taskOrder: 0, dueDate: null },
      enableDelete: false,
    });

    component.cancel();

    expect(dialogRefSpy.close).toHaveBeenCalledWith();
  });

  it('dueDateValue getter parses the ISO date string without a timezone shift', () => {
    setup({
      task: { title: '', description: '', status: TaskStatus.A_FAZER, taskOrder: 0, dueDate: '2026-08-01' },
      enableDelete: false,
    });

    const date = component.dueDateValue;

    expect(date?.getFullYear()).toBe(2026);
    expect(date?.getMonth()).toBe(7); // 0-indexed: August
    expect(date?.getDate()).toBe(1);
  });

  it('dueDateValue setter writes back an ISO date string', () => {
    setup({
      task: { title: '', description: '', status: TaskStatus.A_FAZER, taskOrder: 0, dueDate: null },
      enableDelete: false,
    });

    component.dueDateValue = new Date(2026, 7, 1);

    expect(component.data.task.dueDate).toBe('2026-08-01');
  });

  it('dueDateValue setter writes null when cleared', () => {
    setup({
      task: { title: '', description: '', status: TaskStatus.A_FAZER, taskOrder: 0, dueDate: '2026-08-01' },
      enableDelete: false,
    });

    component.dueDateValue = null;

    expect(component.data.task.dueDate).toBeNull();
  });
});
