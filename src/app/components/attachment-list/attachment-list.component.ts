import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Attachment } from '../../models/attachment.model';
import { AttachmentService } from '../../services/attachment.service';
import { NotificationService } from '../../services/notification.service';

const MAX_SIZE_BYTES = 5 * 1024 * 1024;

@Component({
  selector: 'app-attachment-list',
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './attachment-list.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./attachment-list.component.scss'],
})
export class AttachmentListComponent implements OnInit {
  @Input({ required: true }) taskId!: number;

  attachments: Attachment[] = [];

  constructor(
    private attachmentService: AttachmentService,
    private notificationService: NotificationService,
  ) {}

  ngOnInit(): void {
    this.loadAttachments();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) {
      return;
    }

    if (file.size > MAX_SIZE_BYTES) {
      this.notificationService.error('O arquivo excede o limite de 5MB.');
      return;
    }

    this.attachmentService.upload(this.taskId, file).subscribe({
      next: (attachment) => this.attachments.push(attachment),
      error: () => this.notificationService.error('Não foi possível enviar o anexo. Verifique o tipo do arquivo.'),
    });
  }

  downloadAttachment(attachment: Attachment): void {
    this.attachmentService.download(this.taskId, attachment.id).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = attachment.fileName;
        link.click();
        URL.revokeObjectURL(url);
      },
      error: () => this.notificationService.error('Não foi possível baixar o anexo.'),
    });
  }

  removeAttachment(attachment: Attachment): void {
    this.attachmentService.deleteAttachment(this.taskId, attachment.id).subscribe({
      next: () => {
        this.attachments = this.attachments.filter((existing) => existing.id !== attachment.id);
      },
      error: () => this.notificationService.error('Não foi possível remover o anexo.'),
    });
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) {
      return `${bytes} B`;
    }
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  private loadAttachments(): void {
    this.attachmentService.getAttachments(this.taskId).subscribe({
      next: (attachments) => (this.attachments = attachments),
      error: () => this.notificationService.error('Não foi possível carregar os anexos.'),
    });
  }
}
