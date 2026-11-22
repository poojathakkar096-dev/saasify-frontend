import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatBadgeModule } from '@angular/material/badge';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SubscriptionService } from '../../core/services/subscription.service';
import { PlanInfo, Subscription } from '../../core/models/subscription.model';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-subscription',
  standalone: true,
  imports: [
    DatePipe,
    MatCardModule, MatButtonModule, MatIconModule,
    MatProgressSpinnerModule, MatDividerModule, MatListModule,
    MatBadgeModule, MatExpansionModule, MatTableModule, MatChipsModule
  ],
  template: `
    <div class="subscription-page">
      <h2>Subscription</h2>

      @if (loading()) {
        <div class="loading-center"><mat-spinner></mat-spinner></div>
      } @else {
        @if (currentSub()) {
          <mat-card class="current-plan-card">
            <mat-card-header>
              <mat-icon mat-card-avatar [class]="'plan-icon ' + planClass(currentSub()!.planId)">credit_card</mat-icon>
              <mat-card-title>Current Plan: {{ currentSub()!.planId }}</mat-card-title>
              <mat-card-subtitle>Status: {{ currentSub()!.status }}</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <div class="plan-details">
                <div class="detail-item">
                  <mat-icon>calendar_today</mat-icon>
                  <span>Started: {{ currentSub()!.startDate | date:'mediumDate' }}</span>
                </div>
              </div>
            </mat-card-content>
            <mat-card-actions>
              @if (currentSub()!.status === 'Active') {
                <button mat-stroked-button color="warn" (click)="cancelSub()">
                  <mat-icon>cancel</mat-icon> Cancel Subscription
                </button>
              }
            </mat-card-actions>
          </mat-card>
        }

        <h3 class="section-title">Available Plans</h3>
        <div class="plans-grid">
          @for (plan of plans(); track plan.planId) {
            <mat-card class="plan-card" [class.current-plan]="currentSub()?.planId === plan.planId">
              @if (currentSub()?.planId === plan.planId) {
                <div class="current-badge">Current</div>
              }
              <mat-card-header>
                <mat-card-title [class]="'plan-title ' + planClass(plan.planId)">{{ plan.name }}</mat-card-title>
                <mat-card-subtitle>
                  <span class="price">₹{{ plan.price }}<span class="period">/month</span></span>
                </mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <div class="max-customers">
                  <mat-icon>group</mat-icon>
                  <span>{{ plan.maxCustomers === -1 ? 'Unlimited' : plan.maxCustomers }} customers</span>
                </div>
                <mat-divider></mat-divider>
                <mat-list dense>
                  @for (feature of plan.features; track feature) {
                    <mat-list-item>
                      <mat-icon matListItemIcon class="check-icon">check_circle</mat-icon>
                      <span matListItemTitle>{{ feature }}</span>
                    </mat-list-item>
                  }
                </mat-list>
              </mat-card-content>
              <mat-card-actions>
                @if (currentSub()?.planId !== plan.planId) {
                  <button mat-flat-button [color]="planButtonColor(plan.planId)"
                    (click)="switchPlan(plan)" [disabled]="switching()">
                    Switch to {{ plan.name }}
                  </button>
                }
              </mat-card-actions>
            </mat-card>
          }
        </div>

        <mat-expansion-panel class="history-panel">
          <mat-expansion-panel-header>
            <mat-panel-title>Subscription History</mat-panel-title>
          </mat-expansion-panel-header>
          @if (history().length === 0) {
            <p class="empty-state">No subscription history.</p>
          } @else {
            <table mat-table [dataSource]="history()" class="history-table">
              <ng-container matColumnDef="plan">
                <th mat-header-cell *matHeaderCellDef>Plan</th>
                <td mat-cell *matCellDef="let s">{{ s.planId }}</td>
              </ng-container>
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let s">{{ s.status }}</td>
              </ng-container>
              <ng-container matColumnDef="start">
                <th mat-header-cell *matHeaderCellDef>Start</th>
                <td mat-cell *matCellDef="let s">{{ s.startDate | date:'mediumDate' }}</td>
              </ng-container>
              <ng-container matColumnDef="end">
                <th mat-header-cell *matHeaderCellDef>End</th>
                <td mat-cell *matCellDef="let s">{{ s.endDate ? (s.endDate | date:'mediumDate') : '—' }}</td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="histCols"></tr>
              <tr mat-row *matRowDef="let r; columns: histCols;"></tr>
            </table>
          }
        </mat-expansion-panel>
      }
    </div>
  `,
  styles: [`
    .subscription-page { max-width: 1100px; }
    h2 { font-size: 1.8rem; margin: 0 0 24px; }
    .loading-center { display: flex; justify-content: center; padding: 48px; }
    .current-plan-card { margin-bottom: 32px; border-left: 4px solid #3f51b5; }
    .plan-icon { display: flex; align-items: center; justify-content: center; width: 40px; height: 40px;
      border-radius: 50%; color: white; }
    .plan-free { background: #9e9e9e; color: white; }
    .plan-pro { background: #2196f3; color: white; }
    .plan-premium { background: #ff9800; color: white; }
    .plan-details { display: flex; gap: 24px; margin: 8px 0; }
    .detail-item { display: flex; align-items: center; gap: 8px; color: #555; }
    .section-title { font-size: 1.3rem; margin: 0 0 16px; }
    .plans-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 32px; }
    .plan-card { position: relative; }
    .current-plan { border: 2px solid #3f51b5; }
    .current-badge { position: absolute; top: 12px; right: 12px; background: #3f51b5; color: white;
      padding: 2px 10px; border-radius: 12px; font-size: 0.75rem; font-weight: 600; }
    .plan-title { font-size: 1.3rem; font-weight: 700; padding: 4px 8px; border-radius: 4px; display: inline-block; }
    .price { font-size: 1.8rem; font-weight: 700; }
    .period { font-size: 0.9rem; color: #888; }
    .max-customers { display: flex; align-items: center; gap: 8px; margin: 12px 0 8px; color: #555; }
    .check-icon { color: #4caf50 !important; font-size: 18px !important; width: 18px !important; height: 18px !important; }
    .history-panel { margin-top: 8px; }
    .history-table { width: 100%; }
    .empty-state { color: #888; text-align: center; padding: 24px; }
    @media (max-width: 768px) { .plans-grid { grid-template-columns: 1fr; } }
  `]
})
export class SubscriptionComponent implements OnInit {
  private subSvc = inject(SubscriptionService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  loading = signal(true);
  switching = signal(false);
  currentSub = signal<Subscription | null>(null);
  plans = signal<PlanInfo[]>([]);
  history = signal<Subscription[]>([]);
  histCols = ['plan', 'status', 'start', 'end'];

  planClass(planId: string) {
    return `plan-${planId.toLowerCase()}`;
  }

  planButtonColor(planId: string) {
    return planId === 'Premium' ? 'accent' : 'primary';
  }

  ngOnInit(): void {
    let done = 0;
    const finish = () => { if (++done === 3) this.loading.set(false); };

    this.subSvc.getCurrent().subscribe({ next: s => { this.currentSub.set(s); finish(); }, error: () => finish() });
    this.subSvc.getPlans().subscribe({ next: p => { this.plans.set(p); finish(); }, error: () => finish() });
    this.subSvc.getHistory().subscribe({ next: h => { this.history.set(h); finish(); }, error: () => finish() });
  }

  switchPlan(plan: PlanInfo): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Switch Plan',
        message: `Switch to ${plan.name} plan for ₹${plan.price}/month?`,
        confirmText: 'Switch',
        cancelText: 'Cancel'
      }
    });
    ref.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.switching.set(true);
      this.subSvc.save(plan.planId).subscribe({
        next: (sub) => {
          this.currentSub.set(sub);
          this.switching.set(false);
          this.snackBar.open(`Switched to ${plan.name}!`, 'Close', { duration: 3000 });
        },
        error: () => {
          this.switching.set(false);
          this.snackBar.open('Failed to switch plan', 'Close', { duration: 3000 });
        }
      });
    });
  }

  cancelSub(): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Cancel Subscription',
        message: 'Are you sure you want to cancel your subscription? You will lose access to premium features.',
        confirmText: 'Yes, Cancel',
        cancelText: 'Keep Subscription'
      }
    });
    ref.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.subSvc.cancel().subscribe({
        next: () => {
          this.snackBar.open('Subscription cancelled', 'Close', { duration: 3000 });
          this.ngOnInit();
        },
        error: () => this.snackBar.open('Failed to cancel', 'Close', { duration: 3000 })
      });
    });
  }
}
