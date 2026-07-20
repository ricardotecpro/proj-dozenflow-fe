import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { CommentListComponent } from './comment-list.component';
import { CommentService } from '../../services/comment.service';
import { NotificationService } from '../../services/notification.service';
import { Comment } from '../../models/comment.model';

describe('CommentListComponent', () => {
  let fixture: ComponentFixture<CommentListComponent>;
  let component: CommentListComponent;
  let commentServiceSpy: jasmine.SpyObj<CommentService>;
  let notificationServiceSpy: jasmine.SpyObj<NotificationService>;

  const comments: Comment[] = [
    { id: 1, body: 'First', createdAt: '2026-01-01T10:00:00Z' },
    { id: 2, body: 'Second', createdAt: '2026-01-01T11:00:00Z' },
  ];

  function setup(initialComments: Comment[] = comments) {
    commentServiceSpy = jasmine.createSpyObj('CommentService', ['getComments', 'createComment', 'deleteComment']);
    notificationServiceSpy = jasmine.createSpyObj('NotificationService', ['success', 'error']);
    commentServiceSpy.getComments.and.returnValue(of(initialComments.map((comment) => ({ ...comment }))));

    TestBed.configureTestingModule({
      imports: [CommentListComponent],
      providers: [
        { provide: CommentService, useValue: commentServiceSpy },
        { provide: NotificationService, useValue: notificationServiceSpy },
      ],
    });

    fixture = TestBed.createComponent(CommentListComponent);
    component = fixture.componentInstance;
    component.taskId = 1;
    fixture.detectChanges();
  }

  it('loads the comments on init', () => {
    setup();

    expect(component.comments).toEqual(comments);
  });

  it('notifies an error when loading comments fails', () => {
    commentServiceSpy = jasmine.createSpyObj('CommentService', ['getComments', 'createComment', 'deleteComment']);
    notificationServiceSpy = jasmine.createSpyObj('NotificationService', ['success', 'error']);
    commentServiceSpy.getComments.and.returnValue(throwError(() => new Error('fail')));

    TestBed.configureTestingModule({
      imports: [CommentListComponent],
      providers: [
        { provide: CommentService, useValue: commentServiceSpy },
        { provide: NotificationService, useValue: notificationServiceSpy },
      ],
    });
    fixture = TestBed.createComponent(CommentListComponent);
    component = fixture.componentInstance;
    component.taskId = 1;
    fixture.detectChanges();

    expect(notificationServiceSpy.error).toHaveBeenCalled();
  });

  it('addComment() creates a comment and clears the input', () => {
    setup();
    const created: Comment = { id: 3, body: 'New comment', createdAt: '2026-01-01T12:00:00Z' };
    commentServiceSpy.createComment.and.returnValue(of(created));
    component.newCommentBody = 'New comment';

    component.addComment();

    expect(commentServiceSpy.createComment).toHaveBeenCalledWith(1, 'New comment');
    expect(component.comments).toContain(created);
    expect(component.newCommentBody).toBe('');
  });

  it('addComment() does nothing for a blank body', () => {
    setup();
    component.newCommentBody = '   ';

    component.addComment();

    expect(commentServiceSpy.createComment).not.toHaveBeenCalled();
  });

  it('addComment() notifies an error when the request fails', () => {
    setup();
    commentServiceSpy.createComment.and.returnValue(throwError(() => new Error('fail')));
    component.newCommentBody = 'New comment';

    component.addComment();

    expect(notificationServiceSpy.error).toHaveBeenCalled();
  });

  it('removeComment() deletes the comment and removes it from the list', () => {
    setup();
    commentServiceSpy.deleteComment.and.returnValue(of(undefined));

    component.removeComment(component.comments[0]);

    expect(commentServiceSpy.deleteComment).toHaveBeenCalledWith(1, 1);
    expect(component.comments.find((comment) => comment.id === 1)).toBeUndefined();
  });

  it('removeComment() notifies an error when the request fails', () => {
    setup();
    commentServiceSpy.deleteComment.and.returnValue(throwError(() => new Error('fail')));

    component.removeComment(component.comments[0]);

    expect(notificationServiceSpy.error).toHaveBeenCalled();
  });

  it('relativeTime() formats a recent past timestamp in minutes', () => {
    setup();
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60_000).toISOString();

    const result = component.relativeTime(fiveMinutesAgo);

    expect(result).toContain('5');
  });
});
