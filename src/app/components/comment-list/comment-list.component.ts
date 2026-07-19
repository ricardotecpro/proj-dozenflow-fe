import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Comment } from '../../models/comment.model';
import { CommentService } from '../../services/comment.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-comment-list',
  imports: [FormsModule, MatButtonModule, MatIconModule],
  templateUrl: './comment-list.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./comment-list.component.scss'],
})
export class CommentListComponent implements OnInit {
  @Input({ required: true }) taskId!: number;

  comments: Comment[] = [];
  newCommentBody = '';

  constructor(
    private commentService: CommentService,
    private notificationService: NotificationService,
  ) {}

  ngOnInit(): void {
    this.loadComments();
  }

  addComment(): void {
    const body = this.newCommentBody.trim();
    if (!body) {
      return;
    }

    this.commentService.createComment(this.taskId, body).subscribe({
      next: (comment) => {
        this.comments.push(comment);
        this.newCommentBody = '';
      },
      error: () => this.notificationService.error('Não foi possível adicionar o comentário.'),
    });
  }

  removeComment(comment: Comment): void {
    this.commentService.deleteComment(this.taskId, comment.id).subscribe({
      next: () => {
        this.comments = this.comments.filter((existing) => existing.id !== comment.id);
      },
      error: () => this.notificationService.error('Não foi possível remover o comentário.'),
    });
  }

  relativeTime(iso: string): string {
    const diffMs = new Date(iso).getTime() - Date.now();
    const diffMinutes = Math.round(diffMs / 60_000);
    const rtf = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' });

    if (Math.abs(diffMinutes) < 60) {
      return rtf.format(diffMinutes, 'minute');
    }
    const diffHours = Math.round(diffMinutes / 60);
    if (Math.abs(diffHours) < 24) {
      return rtf.format(diffHours, 'hour');
    }
    const diffDays = Math.round(diffHours / 24);
    return rtf.format(diffDays, 'day');
  }

  private loadComments(): void {
    this.commentService.getComments(this.taskId).subscribe({
      next: (comments) => (this.comments = comments),
      error: () => this.notificationService.error('Não foi possível carregar os comentários.'),
    });
  }
}
