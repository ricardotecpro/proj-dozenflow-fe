import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ChecklistItem } from '../models/checklist-item.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ChecklistItemService {
  private apiUrl = `${environment.apiUrl}/tasks`;

  constructor(private http: HttpClient) {}

  getItems(taskId: number): Observable<ChecklistItem[]> {
    return this.http.get<ChecklistItem[]>(`${this.apiUrl}/${taskId}/checklist-items`);
  }

  createItem(taskId: number, item: Partial<ChecklistItem>): Observable<ChecklistItem> {
    return this.http.post<ChecklistItem>(`${this.apiUrl}/${taskId}/checklist-items`, item);
  }

  updateItem(taskId: number, itemId: number, item: Partial<ChecklistItem>): Observable<ChecklistItem> {
    return this.http.put<ChecklistItem>(`${this.apiUrl}/${taskId}/checklist-items/${itemId}`, item);
  }

  deleteItem(taskId: number, itemId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${taskId}/checklist-items/${itemId}`);
  }
}
