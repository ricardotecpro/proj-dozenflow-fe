import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TaskCardComponent } from './task-card.component';
import { Task, TaskStatus } from '../../models/task.model';

describe('TaskCardComponent', () => {
  let fixture: ComponentFixture<TaskCardComponent>;
  let component: TaskCardComponent;

  const task: Task = {
    id: 1,
    title: 'Write specs',
    description: 'Cover the kanban board components',
    status: TaskStatus.A_FAZER,
    taskOrder: 0,
    dueDate: null,
    labels: [],
  };

  function isoDateOffsetBy(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() + days);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TaskCardComponent],
    });
    fixture = TestBed.createComponent(TaskCardComponent);
    component = fixture.componentInstance;
    component.task = task;
    fixture.detectChanges();
  });

  it('renders the task title', () => {
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Write specs');
  });

  it('shows a description indicator when the task has a description (Trello-style, no inline text)', () => {
    const text = fixture.nativeElement.textContent as string;
    const footer = fixture.debugElement.query(By.css('.task-card-footer'));

    expect(footer).not.toBeNull();
    expect(text).not.toContain('Cover the kanban board components');
  });

  it('does not render the description indicator when there is no description', () => {
    component.task = { ...task, description: '' };
    fixture.detectChanges();

    const footer = fixture.debugElement.query(By.css('.task-card-footer'));
    expect(footer).toBeNull();
  });

  it('does not show a due-date pill when there is no due date', () => {
    component.task = { ...task, description: '', dueDate: null };
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('.due-date-pill'))).toBeNull();
  });

  it('marks a future due date as default (not overdue/due-soon)', () => {
    component.task = { ...task, description: '', dueDate: isoDateOffsetBy(10) };
    fixture.detectChanges();

    const pill = fixture.debugElement.query(By.css('.due-date-pill'));
    expect(pill).not.toBeNull();
    expect(pill.classes['default']).toBeTrue();
  });

  it('marks a due date within 2 days as due-soon', () => {
    component.task = { ...task, description: '', dueDate: isoDateOffsetBy(1) };
    fixture.detectChanges();

    const pill = fixture.debugElement.query(By.css('.due-date-pill'));
    expect(pill.classes['due-soon']).toBeTrue();
  });

  it('marks a past due date as overdue', () => {
    component.task = { ...task, description: '', dueDate: isoDateOffsetBy(-1) };
    fixture.detectChanges();

    const pill = fixture.debugElement.query(By.css('.due-date-pill'));
    expect(pill.classes['overdue']).toBeTrue();
  });

  it('marks the due date as done when the task is CONCLUIDA, even if the date is past', () => {
    component.task = {
      ...task,
      description: '',
      status: TaskStatus.CONCLUIDA,
      dueDate: isoDateOffsetBy(-5),
    };
    fixture.detectChanges();

    const pill = fixture.debugElement.query(By.css('.due-date-pill'));
    expect(pill.classes['done']).toBeTrue();
    expect(pill.classes['overdue']).toBeFalsy();
  });

  it('does not render label bars when the task has no labels', () => {
    expect(fixture.debugElement.query(By.css('.task-card-labels'))).toBeNull();
  });

  it('renders one bar per label, colored by colorHex', () => {
    component.task = {
      ...task,
      labels: [
        { id: 1, name: null, colorHex: '#61bd4f' },
        { id: 2, name: 'Urgente', colorHex: '#eb5a46' },
      ],
    };
    fixture.detectChanges();

    const bars = fixture.debugElement.queryAll(By.css('.label-bar'));
    expect(bars.length).toBe(2);
    expect((bars[0].nativeElement as HTMLElement).style.backgroundColor).toBe('rgb(97, 189, 79)');
  });

  it('emits edit when edit() is triggered', () => {
    const editSpy = jasmine.createSpy('edit');
    component.edit.subscribe(editSpy);

    component.edit.emit();

    expect(editSpy).toHaveBeenCalled();
  });

  it('emits delete when delete() is triggered', () => {
    const deleteSpy = jasmine.createSpy('delete');
    component.delete.subscribe(deleteSpy);

    component.delete.emit();

    expect(deleteSpy).toHaveBeenCalled();
  });
});
