import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { LabelPickerComponent } from './label-picker.component';
import { LabelService } from '../../services/label.service';
import { TaskService } from '../../services/task.service';
import { NotificationService } from '../../services/notification.service';
import { Label } from '../../models/label.model';
import { Task, TaskStatus } from '../../models/task.model';

describe('LabelPickerComponent', () => {
  let fixture: ComponentFixture<LabelPickerComponent>;
  let component: LabelPickerComponent;
  let labelServiceSpy: jasmine.SpyObj<LabelService>;
  let taskServiceSpy: jasmine.SpyObj<TaskService>;
  let notificationServiceSpy: jasmine.SpyObj<NotificationService>;

  const green: Label = { id: 1, name: null, colorHex: '#61bd4f' };
  const red: Label = { id: 2, name: 'Urgente', colorHex: '#eb5a46' };

  const task: Task = {
    id: 5,
    title: 'Task',
    description: '',
    status: TaskStatus.A_FAZER,
    taskOrder: 0,
    dueDate: null,
    labels: [red],
    checklistTotal: 0,
    checklistDone: 0,
  };

  function setup(selectedLabels: Label[] = []) {
    labelServiceSpy = jasmine.createSpyObj('LabelService', ['getLabels']);
    taskServiceSpy = jasmine.createSpyObj('TaskService', ['attachLabel', 'detachLabel']);
    notificationServiceSpy = jasmine.createSpyObj('NotificationService', ['success', 'error']);
    labelServiceSpy.getLabels.and.returnValue(of([green, red]));

    TestBed.configureTestingModule({
      imports: [LabelPickerComponent],
      providers: [
        { provide: LabelService, useValue: labelServiceSpy },
        { provide: TaskService, useValue: taskServiceSpy },
        { provide: NotificationService, useValue: notificationServiceSpy },
      ],
    });

    fixture = TestBed.createComponent(LabelPickerComponent);
    component = fixture.componentInstance;
    component.taskId = 5;
    component.selectedLabels = selectedLabels;
    fixture.detectChanges();
  }

  it('loads the label catalog on init', () => {
    setup();

    expect(component.allLabels).toEqual([green, red]);
  });

  it('notifies an error when loading the catalog fails', () => {
    labelServiceSpy = jasmine.createSpyObj('LabelService', ['getLabels']);
    taskServiceSpy = jasmine.createSpyObj('TaskService', ['attachLabel', 'detachLabel']);
    notificationServiceSpy = jasmine.createSpyObj('NotificationService', ['success', 'error']);
    labelServiceSpy.getLabels.and.returnValue(throwError(() => new Error('fail')));

    TestBed.configureTestingModule({
      imports: [LabelPickerComponent],
      providers: [
        { provide: LabelService, useValue: labelServiceSpy },
        { provide: TaskService, useValue: taskServiceSpy },
        { provide: NotificationService, useValue: notificationServiceSpy },
      ],
    });
    fixture = TestBed.createComponent(LabelPickerComponent);
    component = fixture.componentInstance;
    component.taskId = 5;
    fixture.detectChanges();

    expect(notificationServiceSpy.error).toHaveBeenCalled();
  });

  it('isSelected() reports true only for labels already on the task', () => {
    setup([red]);

    expect(component.isSelected(red)).toBeTrue();
    expect(component.isSelected(green)).toBeFalse();
  });

  it('toggle() attaches an unselected label and emits the updated list', () => {
    setup([]);
    taskServiceSpy.attachLabel.and.returnValue(of(task));
    const emitSpy = spyOn(component.labelsChanged, 'emit');

    component.toggle(red);

    expect(taskServiceSpy.attachLabel).toHaveBeenCalledWith(5, 2);
    expect(emitSpy).toHaveBeenCalledWith(task.labels);
  });

  it('toggle() detaches an already-selected label', () => {
    setup([red]);
    taskServiceSpy.detachLabel.and.returnValue(of({ ...task, labels: [] }));
    const emitSpy = spyOn(component.labelsChanged, 'emit');

    component.toggle(red);

    expect(taskServiceSpy.detachLabel).toHaveBeenCalledWith(5, 2);
    expect(emitSpy).toHaveBeenCalledWith([]);
  });

  it('toggle() notifies an error when the request fails', () => {
    setup([]);
    taskServiceSpy.attachLabel.and.returnValue(throwError(() => new Error('fail')));

    component.toggle(red);

    expect(notificationServiceSpy.error).toHaveBeenCalled();
  });
});
