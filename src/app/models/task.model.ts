import { Label } from './label.model';

export interface Task {
  id: number;
  title: string;
  description: string;
  listId: number;
  taskOrder: number;
  archived: boolean;
  /** ISO date string (yyyy-MM-dd), or null when no due date is set. */
  dueDate: string | null;
  /** Hex color (e.g. "#0079bf") for the card cover, or null when there's no cover. */
  coverColor: string | null;
  labels: Label[];
  checklistTotal: number;
  checklistDone: number;
  commentCount: number;
  attachmentCount: number;
}
