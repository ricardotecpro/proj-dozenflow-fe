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
}
