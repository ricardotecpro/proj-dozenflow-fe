import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { LabelService } from './label.service';
import { Label } from '../models/label.model';

describe('LabelService', () => {
  let service: LabelService;
  let httpMock: HttpTestingController;

  const sampleLabel: Label = { id: 1, name: null, colorHex: '#61bd4f' };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(LabelService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('getLabels() issues a GET to /api/labels', () => {
    service.getLabels().subscribe((labels) => {
      expect(labels).toEqual([sampleLabel]);
    });

    const req = httpMock.expectOne('/api/labels');
    expect(req.request.method).toBe('GET');
    req.flush([sampleLabel]);
  });

  it('createLabel() issues a POST with the label payload', () => {
    const payload: Partial<Label> = { name: 'Urgente', colorHex: '#eb5a46' };

    service.createLabel(payload).subscribe((label) => {
      expect(label).toEqual(sampleLabel);
    });

    const req = httpMock.expectOne('/api/labels');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(sampleLabel);
  });

  it('updateLabel() issues a PUT to /api/labels/:id', () => {
    const payload: Partial<Label> = { name: 'Renomeada' };

    service.updateLabel(1, payload).subscribe((label) => {
      expect(label).toEqual(sampleLabel);
    });

    const req = httpMock.expectOne('/api/labels/1');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(payload);
    req.flush(sampleLabel);
  });

  it('deleteLabel() issues a DELETE to /api/labels/:id', () => {
    service.deleteLabel(1).subscribe();

    const req = httpMock.expectOne('/api/labels/1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
