import { Label } from './label.model';

export enum TaskStatus {
  A_FAZER = 'A_FAZER',
  EM_ANDAMENTO = 'EM_ANDAMENTO',
  CONCLUIDA = 'CONCLUIDA',
}

export interface Task {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  taskOrder: number;
  /** ISO date string (yyyy-MM-dd), or null when no due date is set. */
  dueDate: string | null;
  labels: Label[];
  checklistTotal: number;
  checklistDone: number;
}
