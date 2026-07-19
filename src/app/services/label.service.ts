import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Label } from '../models/label.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LabelService {
  private apiUrl = `${environment.apiUrl}/labels`;

  constructor(private http: HttpClient) {}

  getLabels(): Observable<Label[]> {
    return this.http.get<Label[]>(this.apiUrl);
  }

  createLabel(label: Partial<Label>): Observable<Label> {
    return this.http.post<Label>(this.apiUrl, label);
  }

  updateLabel(id: number, label: Partial<Label>): Observable<Label> {
    return this.http.put<Label>(`${this.apiUrl}/${id}`, label);
  }

  deleteLabel(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
