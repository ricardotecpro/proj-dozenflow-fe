import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { CommentService } from './comment.service';
import { Comment } from '../models/comment.model';

describe('CommentService', () => {
  let service: CommentService;
  let httpMock: HttpTestingController;

  const sampleComment: Comment = { id: 1, body: 'Sample', createdAt: '2026-08-01T12:00:00Z' };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CommentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('getComments() issues a GET to /api/tasks/:taskId/comments', () => {
    service.getComments(1).subscribe((comments) => {
      expect(comments).toEqual([sampleComment]);
    });

    const req = httpMock.expectOne('/api/tasks/1/comments');
    expect(req.request.method).toBe('GET');
    req.flush([sampleComment]);
  });

  it('createComment() issues a POST with the comment body', () => {
    service.createComment(1, 'Sample').subscribe((comment) => {
      expect(comment).toEqual(sampleComment);
    });

    const req = httpMock.expectOne('/api/tasks/1/comments');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ body: 'Sample' });
    req.flush(sampleComment);
  });

  it('deleteComment() issues a DELETE to /api/tasks/:taskId/comments/:commentId', () => {
    service.deleteComment(1, 2).subscribe();

    const req = httpMock.expectOne('/api/tasks/1/comments/2');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
