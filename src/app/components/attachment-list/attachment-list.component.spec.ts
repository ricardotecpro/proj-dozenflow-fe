import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { AttachmentListComponent } from './attachment-list.component';
import { AttachmentService } from '../../services/attachment.service';
import { NotificationService } from '../../services/notification.service';
import { Attachment } from '../../models/attachment.model';

describe('AttachmentListComponent', () => {
  let fixture: ComponentFixture<AttachmentListComponent>;
  let component: AttachmentListComponent;
  let attachmentServiceSpy: jasmine.SpyObj<AttachmentService>;
  let notificationServiceSpy: jasmine.SpyObj<NotificationService>;

  const attachments: Attachment[] = [
    { id: 1, fileName: 'mockup.png', contentType: 'image/png', sizeBytes: 2048, createdAt: '2026-01-01T10:00:00Z' },
  ];

  function setup(initialAttachments: Attachment[] = attachments) {
    attachmentServiceSpy = jasmine.createSpyObj('AttachmentService', [
      'getAttachments',
      'upload',
      'download',
      'deleteAttachment',
    ]);
    notificationServiceSpy = jasmine.createSpyObj('NotificationService', ['success', 'error']);
    attachmentServiceSpy.getAttachments.and.returnValue(of(initialAttachments.map((a) => ({ ...a }))));

    TestBed.configureTestingModule({
      imports: [AttachmentListComponent],
      providers: [
        { provide: AttachmentService, useValue: attachmentServiceSpy },
        { provide: NotificationService, useValue: notificationServiceSpy },
      ],
    });

    fixture = TestBed.createComponent(AttachmentListComponent);
    component = fixture.componentInstance;
    component.taskId = 1;
    fixture.detectChanges();
  }

  function fakeInputEvent(file: File | null): Event {
    const input = document.createElement('input');
    input.type = 'file';
    if (file) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      input.files = dataTransfer.files;
    }
    return { target: input } as unknown as Event;
  }

  it('loads the attachments on init', () => {
    setup();

    expect(component.attachments).toEqual(attachments);
  });

  it('notifies an error when loading attachments fails', () => {
    attachmentServiceSpy = jasmine.createSpyObj('AttachmentService', [
      'getAttachments',
      'upload',
      'download',
      'deleteAttachment',
    ]);
    notificationServiceSpy = jasmine.createSpyObj('NotificationService', ['success', 'error']);
    attachmentServiceSpy.getAttachments.and.returnValue(throwError(() => new Error('fail')));

    TestBed.configureTestingModule({
      imports: [AttachmentListComponent],
      providers: [
        { provide: AttachmentService, useValue: attachmentServiceSpy },
        { provide: NotificationService, useValue: notificationServiceSpy },
      ],
    });
    fixture = TestBed.createComponent(AttachmentListComponent);
    component = fixture.componentInstance;
    component.taskId = 1;
    fixture.detectChanges();

    expect(notificationServiceSpy.error).toHaveBeenCalled();
  });

  it('onFileSelected() uploads a valid file and adds it to the list', () => {
    setup();
    const file = new File(['content'], 'notes.txt', { type: 'text/plain' });
    const uploaded: Attachment = {
      id: 2,
      fileName: 'notes.txt',
      contentType: 'text/plain',
      sizeBytes: 7,
      createdAt: '2026-01-01T12:00:00Z',
    };
    attachmentServiceSpy.upload.and.returnValue(of(uploaded));

    component.onFileSelected(fakeInputEvent(file));

    expect(attachmentServiceSpy.upload).toHaveBeenCalledWith(1, file);
    expect(component.attachments).toContain(uploaded);
  });

  it('onFileSelected() rejects a file over 5MB without calling the service', () => {
    setup();
    const bigFile = new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'big.png', { type: 'image/png' });

    component.onFileSelected(fakeInputEvent(bigFile));

    expect(attachmentServiceSpy.upload).not.toHaveBeenCalled();
    expect(notificationServiceSpy.error).toHaveBeenCalledWith('O arquivo excede o limite de 5MB.');
  });

  it('onFileSelected() does nothing when no file was selected', () => {
    setup();

    component.onFileSelected(fakeInputEvent(null));

    expect(attachmentServiceSpy.upload).not.toHaveBeenCalled();
  });

  it('onFileSelected() notifies an error when the upload fails', () => {
    setup();
    const file = new File(['content'], 'notes.txt', { type: 'text/plain' });
    attachmentServiceSpy.upload.and.returnValue(throwError(() => new Error('fail')));

    component.onFileSelected(fakeInputEvent(file));

    expect(notificationServiceSpy.error).toHaveBeenCalled();
  });

  it('removeAttachment() deletes the attachment and removes it from the list', () => {
    setup();
    attachmentServiceSpy.deleteAttachment.and.returnValue(of(undefined));

    component.removeAttachment(component.attachments[0]);

    expect(attachmentServiceSpy.deleteAttachment).toHaveBeenCalledWith(1, 1);
    expect(component.attachments.find((a) => a.id === 1)).toBeUndefined();
  });

  it('removeAttachment() notifies an error when the request fails', () => {
    setup();
    attachmentServiceSpy.deleteAttachment.and.returnValue(throwError(() => new Error('fail')));

    component.removeAttachment(component.attachments[0]);

    expect(notificationServiceSpy.error).toHaveBeenCalled();
  });

  it('downloadAttachment() notifies an error when the request fails', () => {
    setup();
    attachmentServiceSpy.download.and.returnValue(throwError(() => new Error('fail')));

    component.downloadAttachment(component.attachments[0]);

    expect(notificationServiceSpy.error).toHaveBeenCalled();
  });

  it('formatSize() formats bytes, kilobytes, and megabytes', () => {
    setup();

    expect(component.formatSize(500)).toBe('500 B');
    expect(component.formatSize(2048)).toBe('2.0 KB');
    expect(component.formatSize(3 * 1024 * 1024)).toBe('3.0 MB');
  });
});
