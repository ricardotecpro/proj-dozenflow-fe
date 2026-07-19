import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { TaskService } from './task.service';
import { Task, TaskStatus } from '../models/task.model';

describe('TaskService', () => {
  let service: TaskService;
  let httpMock: HttpTestingController;

  const sampleTask: Task = {
    id: 1,
    title: 'Sample',
    description: 'Sample description',
    status: TaskStatus.A_FAZER,
    taskOrder: 0,
    dueDate: null,
    labels: [],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(TaskService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('getTasks() issues a GET to /api/tasks', () => {
    service.getTasks().subscribe((tasks) => {
      expect(tasks).toEqual([sampleTask]);
    });

    const req = httpMock.expectOne('/api/tasks');
    expect(req.request.method).toBe('GET');
    req.flush([sampleTask]);
  });

  it('createTask() issues a POST with the task payload', () => {
    const payload: Partial<Task> = { title: 'New', status: TaskStatus.A_FAZER, taskOrder: 1 };

    service.createTask(payload).subscribe((task) => {
      expect(task).toEqual(sampleTask);
    });

    const req = httpMock.expectOne('/api/tasks');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(sampleTask);
  });

  it('updateTask() issues a PUT to /api/tasks/:id', () => {
    const payload: Partial<Task> = { title: 'Updated' };

    service.updateTask(1, payload).subscribe((task) => {
      expect(task).toEqual(sampleTask);
    });

    const req = httpMock.expectOne('/api/tasks/1');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(payload);
    req.flush(sampleTask);
  });

  it('deleteTask() issues a DELETE to /api/tasks/:id', () => {
    service.deleteTask(1).subscribe();

    const req = httpMock.expectOne('/api/tasks/1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('attachLabel() issues a POST to /api/tasks/:id/labels/:labelId', () => {
    service.attachLabel(1, 2).subscribe((task) => {
      expect(task).toEqual(sampleTask);
    });

    const req = httpMock.expectOne('/api/tasks/1/labels/2');
    expect(req.request.method).toBe('POST');
    req.flush(sampleTask);
  });

  it('detachLabel() issues a DELETE to /api/tasks/:id/labels/:labelId', () => {
    service.detachLabel(1, 2).subscribe((task) => {
      expect(task).toEqual(sampleTask);
    });

    const req = httpMock.expectOne('/api/tasks/1/labels/2');
    expect(req.request.method).toBe('DELETE');
    req.flush(sampleTask);
  });
});
