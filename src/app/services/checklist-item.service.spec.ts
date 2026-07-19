import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ChecklistItemService } from './checklist-item.service';
import { ChecklistItem } from '../models/checklist-item.model';

describe('ChecklistItemService', () => {
  let service: ChecklistItemService;
  let httpMock: HttpTestingController;

  const sampleItem: ChecklistItem = { id: 1, title: 'Sample', done: false, itemOrder: 0 };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ChecklistItemService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('getItems() issues a GET to /api/tasks/:taskId/checklist-items', () => {
    service.getItems(1).subscribe((items) => {
      expect(items).toEqual([sampleItem]);
    });

    const req = httpMock.expectOne('/api/tasks/1/checklist-items');
    expect(req.request.method).toBe('GET');
    req.flush([sampleItem]);
  });

  it('createItem() issues a POST with the item payload', () => {
    const payload: Partial<ChecklistItem> = { title: 'New', done: false, itemOrder: 1 };

    service.createItem(1, payload).subscribe((item) => {
      expect(item).toEqual(sampleItem);
    });

    const req = httpMock.expectOne('/api/tasks/1/checklist-items');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(sampleItem);
  });

  it('updateItem() issues a PUT to /api/tasks/:taskId/checklist-items/:itemId', () => {
    const payload: Partial<ChecklistItem> = { done: true };

    service.updateItem(1, 2, payload).subscribe((item) => {
      expect(item).toEqual(sampleItem);
    });

    const req = httpMock.expectOne('/api/tasks/1/checklist-items/2');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(payload);
    req.flush(sampleItem);
  });

  it('deleteItem() issues a DELETE to /api/tasks/:taskId/checklist-items/:itemId', () => {
    service.deleteItem(1, 2).subscribe();

    const req = httpMock.expectOne('/api/tasks/1/checklist-items/2');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
