import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { AuthService } from '../../core/services/auth.service';
import { CustomerService } from '../../core/services/customer.service';
import { SubscriptionService } from '../../core/services/subscription.service';
import { Customer } from '../../core/models/customer.model';
import { Subscription } from '../../core/models/subscription.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    RouterLink,
    MatCardModule, MatButtonModule, MatIconModule,
    MatProgressSpinnerModule, MatListModule, MatChipsModule
  ],
  template: `
    <div class="dashboard">
      <h2 class="greeting">Welcome back, {{ auth.currentUser()?.fullName }} 👋</h2>
      <p class="subtitle">Here's what's happening with your business today.</p>

      @if (loading()) {
        <div class="loading-center"><mat-spinner></mat-spinner></div>
      } @else {
        <div class="stats-grid">
          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-icon customers"><mat-icon>people</mat-icon></div>
              <div class="stat-value">{{ customers().length }}</div>
              <div class="stat-label">Total Customers</div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-icon" [class]="planClass()"><mat-icon>credit_card</mat-icon></div>
              <div class="stat-value">{{ currentSub()?.planId ?? 'Free' }}</div>
              <div class="stat-label">Current Plan</div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-icon remaining"><mat-icon>group_add</mat-icon></div>
              <div class="stat-value">{{ remainingSlots() }}</div>
              <div class="stat-label">Slots Remaining</div>
            </mat-card-content>
          </mat-card>
        </div>

        <div class="section-row">
          <mat-card class="recent-card">
            <mat-card-header>
              <mat-card-title>Recent Customers</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              @if (recentCustomers().length === 0) {
                <p class="empty-state">No customers yet. <a routerLink="/customers/new">Add one!</a></p>
              } @else {
                <mat-list>
                  @for (c of recentCustomers(); track c.id) {
                    <mat-list-item>
                      <mat-icon matListItemIcon>person</mat-icon>
                      <span matListItemTitle>{{ c.name }}</span>
                      <span matListItemLine>{{ c.email ?? c.phone ?? 'No contact' }}</span>
                    </mat-list-item>
                  }
                </mat-list>
              }
            </mat-card-content>
          </mat-card>

          <mat-card class="actions-card">
            <mat-card-header>
              <mat-card-title>Quick Actions</mat-card-title>
            </mat-card-header>
            <mat-card-content class="actions-content">
              <button mat-flat-button color="primary" routerLink="/customers/new">
                <mat-icon>person_add</mat-icon> Add Customer
              </button>
              <button mat-stroked-button color="primary" routerLink="/subscription">
                <mat-icon>upgrade</mat-icon> Upgrade Plan
              </button>
              <button mat-stroked-button color="accent" routerLink="/assistant">
                <mat-icon>chat</mat-icon> Ask Assistant
              </button>
            </mat-card-content>
          </mat-card>
        </div>
      }
    </div>
  `,
  styles: [`
    .dashboard { max-width: 1100px; }
    .greeting { font-size: 1.8rem; font-weight: 700; margin: 0 0 4px; }
    .subtitle { color: #666; margin: 0 0 32px; }
    .loading-center { display: flex; justify-content: center; padding: 48px; }
    .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 24px; }
    .stat-card mat-card-content { text-align: center; padding: 24px; }
    .stat-icon { width: 56px; height: 56px; border-radius: 50%; display: flex; align-items: center;
      justify-content: center; margin: 0 auto 12px; }
    .stat-icon mat-icon { color: white; font-size: 28px; width: 28px; height: 28px; }
    .customers { background: #3f51b5; }
    .plan-free { background: #9e9e9e; }
    .plan-pro { background: #2196f3; }
    .plan-premium { background: #ff9800; }
    .remaining { background: #4caf50; }
    .stat-value { font-size: 2.2rem; font-weight: 700; color: #333; }
    .stat-label { color: #888; font-size: 0.9rem; margin-top: 4px; }
    .section-row { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; }
    .recent-card, .actions-card { height: fit-content; }
    .actions-content { display: flex; flex-direction: column; gap: 12px; padding-top: 8px; }
    .actions-content button { justify-content: flex-start; }
    .empty-state { color: #888; text-align: center; padding: 24px 0; }
    .empty-state a { color: #3f51b5; }
    @media (max-width: 768px) {
      .stats-grid { grid-template-columns: 1fr; }
      .section-row { grid-template-columns: 1fr; }
    }
  `]
})
export class DashboardComponent implements OnInit {
  auth = inject(AuthService);
  private customerSvc = inject(CustomerService);
  private subSvc = inject(SubscriptionService);

  loading = signal(true);
  customers = signal<Customer[]>([]);
  currentSub = signal<Subscription | null>(null);
  maxCustomers = signal(10);

  recentCustomers = signal<Customer[]>([]);

  planClass() {
    const plan = this.currentSub()?.planId ?? 'Free';
    return `plan-${plan.toLowerCase()}`;
  }

  remainingSlots() {
    const max = this.maxCustomers();
    if (max === -1) return '∞';
    return Math.max(0, max - this.customers().length);
  }

  ngOnInit(): void {
    let loaded = 0;
    const done = () => { if (++loaded === 2) this.loading.set(false); };

    this.customerSvc.getAll().subscribe({
      next: (list) => {
        this.customers.set(list);
        this.recentCustomers.set(list.slice(0, 5));
        done();
      },
      error: () => done()
    });

    this.subSvc.getCurrent().subscribe({
      next: (sub) => {
        this.currentSub.set(sub);
        done();
      },
      error: () => done()
    });
  }
}
