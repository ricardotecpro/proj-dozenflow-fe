import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
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
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: data },
      ],
    });

    fixture = TestBed.createComponent(TaskDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('shows "Nova Tarefa" for a task without id', () => {
    setup({ task: { title: '', description: '', status: TaskStatus.A_FAZER, taskOrder: 0 }, enableDelete: false });

    const title = fixture.debugElement.query(By.css('h2')).nativeElement.textContent as string;
    expect(title).toContain('Nova Tarefa');
  });

  it('shows "Editar Tarefa" for a task with id', () => {
    setup({
      task: { id: 1, title: 'Existing', description: '', status: TaskStatus.A_FAZER, taskOrder: 0 },
      enableDelete: true,
    });

    const title = fixture.debugElement.query(By.css('h2')).nativeElement.textContent as string;
    expect(title).toContain('Editar Tarefa');
  });

  it('cancel() closes the dialog', () => {
    setup({ task: { title: '', description: '', status: TaskStatus.A_FAZER, taskOrder: 0 }, enableDelete: false });

    component.cancel();

    expect(dialogRefSpy.close).toHaveBeenCalledWith();
  });
});
