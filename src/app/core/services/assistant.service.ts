import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AskRequest, AskResponse, ChatHistoryItem } from '../models/assistant.model';

@Injectable({ providedIn: 'root' })
export class AssistantService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/assistant`;

  ask(req: AskRequest): Observable<AskResponse> {
    return this.http.post<AskResponse>(`${this.apiUrl}/ask`, req);
  }

  getHistory(): Observable<ChatHistoryItem[]> {
    return this.http.get<ChatHistoryItem[]>(`${this.apiUrl}/history`);
  }
}
