import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PlanInfo, Subscription } from '../models/subscription.model';

@Injectable({ providedIn: 'root' })
export class SubscriptionService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/subscriptions`;

  getPlans(): Observable<PlanInfo[]> {
    return this.http.get<PlanInfo[]>(`${this.apiUrl}/plans`);
  }

  getCurrent(): Observable<Subscription> {
    return this.http.get<Subscription>(`${this.apiUrl}/current`);
  }

  save(planId: string): Observable<Subscription> {
    return this.http.post<Subscription>(`${this.apiUrl}/save`, { planId });
  }

  getHistory(): Observable<Subscription[]> {
    return this.http.get<Subscription[]>(`${this.apiUrl}/history`);
  }

  cancel(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/cancel`, {});
  }
}
