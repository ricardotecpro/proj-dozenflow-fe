import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task } from '../models/task.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  // Path relativo: proxy em dev (proxy.conf.json), redirect do Netlify em prod.
  private apiUrl = `${environment.apiUrl}/tasks`;

  constructor(private http: HttpClient) {}

  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.apiUrl);
  }

  getArchivedTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/archived`);
  }

  updateTask(id: number, task: Partial<Task>): Observable<Task> {
    return this.http.put<Task>(`${this.apiUrl}/${id}`, task);
  }

  createTask(task: Partial<Task>): Observable<Task> {
    return this.http.post<Task>(this.apiUrl, task);
  }

  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  archiveTask(id: number): Observable<Task> {
    return this.http.post<Task>(`${this.apiUrl}/${id}/archive`, {});
  }

  restoreTask(id: number): Observable<Task> {
    return this.http.post<Task>(`${this.apiUrl}/${id}/restore`, {});
  }

  attachLabel(taskId: number, labelId: number): Observable<Task> {
    return this.http.post<Task>(`${this.apiUrl}/${taskId}/labels/${labelId}`, {});
  }

  detachLabel(taskId: number, labelId: number): Observable<Task> {
    return this.http.delete<Task>(`${this.apiUrl}/${taskId}/labels/${labelId}`);
  }
}
