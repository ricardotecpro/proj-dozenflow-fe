import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { AttachmentService } from './attachment.service';
import { Attachment } from '../models/attachment.model';

describe('AttachmentService', () => {
  let service: AttachmentService;
  let httpMock: HttpTestingController;

  const sampleAttachment: Attachment = {
    id: 1,
    fileName: 'mockup.png',
    contentType: 'image/png',
    sizeBytes: 1024,
    createdAt: '2026-08-01T12:00:00Z',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AttachmentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('getAttachments() issues a GET to /api/tasks/:taskId/attachments', () => {
    service.getAttachments(1).subscribe((attachments) => {
      expect(attachments).toEqual([sampleAttachment]);
    });

    const req = httpMock.expectOne('/api/tasks/1/attachments');
    expect(req.request.method).toBe('GET');
    req.flush([sampleAttachment]);
  });

  it('upload() issues a POST with the file as multipart form data', () => {
    const file = new File(['content'], 'mockup.png', { type: 'image/png' });

    service.upload(1, file).subscribe((attachment) => {
      expect(attachment).toEqual(sampleAttachment);
    });

    const req = httpMock.expectOne('/api/tasks/1/attachments');
    expect(req.request.method).toBe('POST');
    expect(req.request.body instanceof FormData).toBeTrue();
    req.flush(sampleAttachment);
  });

  it('download() issues a GET expecting a blob response', () => {
    const blob = new Blob(['content']);

    service.download(1, 2).subscribe((result) => {
      expect(result).toBe(blob);
    });

    const req = httpMock.expectOne('/api/tasks/1/attachments/2/download');
    expect(req.request.method).toBe('GET');
    expect(req.request.responseType).toBe('blob');
    req.flush(blob);
  });

  it('deleteAttachment() issues a DELETE to /api/tasks/:taskId/attachments/:attachmentId', () => {
    service.deleteAttachment(1, 2).subscribe();

    const req = httpMock.expectOne('/api/tasks/1/attachments/2');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
