import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Attachment } from '../models/attachment.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AttachmentService {
  private apiUrl = `${environment.apiUrl}/tasks`;

  constructor(private http: HttpClient) {}

  getAttachments(taskId: number): Observable<Attachment[]> {
    return this.http.get<Attachment[]>(`${this.apiUrl}/${taskId}/attachments`);
  }

  upload(taskId: number, file: File): Observable<Attachment> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<Attachment>(`${this.apiUrl}/${taskId}/attachments`, formData);
  }

  download(taskId: number, attachmentId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${taskId}/attachments/${attachmentId}/download`, { responseType: 'blob' });
  }

  /** Direct, cacheable URL for inline display (e.g. <img src>/background-image) — not an HTTP call. */
  viewUrl(taskId: number, attachmentId: number): string {
    return `${this.apiUrl}/${taskId}/attachments/${attachmentId}/view`;
  }

  deleteAttachment(taskId: number, attachmentId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${taskId}/attachments/${attachmentId}`);
  }
}
