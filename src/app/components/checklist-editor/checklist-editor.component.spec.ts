import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ChecklistEditorComponent } from './checklist-editor.component';
import { ChecklistItemService } from '../../services/checklist-item.service';
import { NotificationService } from '../../services/notification.service';
import { ChecklistItem } from '../../models/checklist-item.model';

describe('ChecklistEditorComponent', () => {
  let fixture: ComponentFixture<ChecklistEditorComponent>;
  let component: ChecklistEditorComponent;
  let checklistServiceSpy: jasmine.SpyObj<ChecklistItemService>;
  let notificationServiceSpy: jasmine.SpyObj<NotificationService>;

  const items: ChecklistItem[] = [
    { id: 1, title: 'Item 1', done: true, itemOrder: 0 },
    { id: 2, title: 'Item 2', done: false, itemOrder: 1 },
  ];

  function setup(initialItems: ChecklistItem[] = items) {
    checklistServiceSpy = jasmine.createSpyObj('ChecklistItemService', [
      'getItems',
      'createItem',
      'updateItem',
      'deleteItem',
    ]);
    notificationServiceSpy = jasmine.createSpyObj('NotificationService', ['success', 'error']);
    // Clone: component.items ends up as the same array/objects the mock
    // returns, and tests like toggle()/removeItem() mutate it — without a
    // copy here, that mutation would leak into the shared `items` const
    // and corrupt other tests.
    checklistServiceSpy.getItems.and.returnValue(of(initialItems.map((item) => ({ ...item }))));

    TestBed.configureTestingModule({
      imports: [ChecklistEditorComponent],
      providers: [
        { provide: ChecklistItemService, useValue: checklistServiceSpy },
        { provide: NotificationService, useValue: notificationServiceSpy },
      ],
    });

    fixture = TestBed.createComponent(ChecklistEditorComponent);
    component = fixture.componentInstance;
    component.taskId = 1;
    fixture.detectChanges();
  }

  it('loads the checklist items on init', () => {
    setup();

    expect(component.items).toEqual(items);
  });

  it('doneCount reports how many items are checked off', () => {
    setup();

    expect(component.doneCount).toBe(1);
  });

  it('notifies an error when loading items fails', () => {
    checklistServiceSpy = jasmine.createSpyObj('ChecklistItemService', [
      'getItems',
      'createItem',
      'updateItem',
      'deleteItem',
    ]);
    notificationServiceSpy = jasmine.createSpyObj('NotificationService', ['success', 'error']);
    checklistServiceSpy.getItems.and.returnValue(throwError(() => new Error('fail')));

    TestBed.configureTestingModule({
      imports: [ChecklistEditorComponent],
      providers: [
        { provide: ChecklistItemService, useValue: checklistServiceSpy },
        { provide: NotificationService, useValue: notificationServiceSpy },
      ],
    });
    fixture = TestBed.createComponent(ChecklistEditorComponent);
    component = fixture.componentInstance;
    component.taskId = 1;
    fixture.detectChanges();

    expect(notificationServiceSpy.error).toHaveBeenCalled();
  });

  it('toggle() flips the item done state via the service', () => {
    setup();
    const item = component.items[1];
    checklistServiceSpy.updateItem.and.returnValue(of({ ...item, done: true }));

    component.toggle(item);

    expect(checklistServiceSpy.updateItem).toHaveBeenCalledWith(1, 2, { ...item, done: true });
    expect(item.done).toBeTrue();
  });

  it('addItem() creates a new item and clears the input, keeping order at the end', () => {
    setup();
    const created: ChecklistItem = { id: 3, title: 'New item', done: false, itemOrder: 2 };
    checklistServiceSpy.createItem.and.returnValue(of(created));
    component.newItemTitle = 'New item';

    component.addItem();

    expect(checklistServiceSpy.createItem).toHaveBeenCalledWith(1, { title: 'New item', done: false, itemOrder: 2 });
    expect(component.items).toContain(created);
    expect(component.newItemTitle).toBe('');
  });

  it('addItem() does nothing for a blank title', () => {
    setup();
    component.newItemTitle = '   ';

    component.addItem();

    expect(checklistServiceSpy.createItem).not.toHaveBeenCalled();
  });

  it('removeItem() deletes the item and removes it from the list', () => {
    setup();
    checklistServiceSpy.deleteItem.and.returnValue(of(undefined));

    component.removeItem(items[0]);

    expect(checklistServiceSpy.deleteItem).toHaveBeenCalledWith(1, 1);
    expect(component.items.find((item) => item.id === 1)).toBeUndefined();
  });

  it('removeItem() notifies an error when the request fails', () => {
    setup();
    checklistServiceSpy.deleteItem.and.returnValue(throwError(() => new Error('fail')));

    component.removeItem(items[0]);

    expect(notificationServiceSpy.error).toHaveBeenCalled();
  });
});
