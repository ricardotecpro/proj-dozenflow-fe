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
  };

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
