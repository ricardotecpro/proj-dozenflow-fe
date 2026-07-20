import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TaskList } from '../models/list.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ListService {
  private apiUrl = `${environment.apiUrl}/lists`;

  constructor(private http: HttpClient) {}

  getLists(): Observable<TaskList[]> {
    return this.http.get<TaskList[]>(this.apiUrl);
  }

  getArchivedLists(): Observable<TaskList[]> {
    return this.http.get<TaskList[]>(`${this.apiUrl}/archived`);
  }

  createList(list: Partial<TaskList>): Observable<TaskList> {
    return this.http.post<TaskList>(this.apiUrl, list);
  }

  updateList(id: number, list: Partial<TaskList>): Observable<TaskList> {
    return this.http.put<TaskList>(`${this.apiUrl}/${id}`, list);
  }

  archiveList(id: number): Observable<TaskList> {
    return this.http.post<TaskList>(`${this.apiUrl}/${id}/archive`, {});
  }

  restoreList(id: number): Observable<TaskList> {
    return this.http.post<TaskList>(`${this.apiUrl}/${id}/restore`, {});
  }

  deleteList(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
