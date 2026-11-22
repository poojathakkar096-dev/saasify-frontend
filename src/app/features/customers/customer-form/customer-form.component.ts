import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { CustomerService } from '../../../core/services/customer.service';

@Component({
  selector: 'app-customer-form',
  standalone: true,
  imports: [
    ReactiveFormsModule, RouterLink,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatProgressSpinnerModule, MatIconModule
  ],
  template: `
    <div class="form-page">
      <div class="page-header">
        <button mat-icon-button routerLink="/customers">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h2>{{ isEdit() ? 'Edit Customer' : 'New Customer' }}</h2>
      </div>

      <mat-card class="form-card">
        <mat-card-content>
          @if (loadingData()) {
            <div class="loading-center"><mat-spinner></mat-spinner></div>
          } @else {
            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="customer-form">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Name *</mat-label>
                <input matInput formControlName="name" placeholder="Customer name" />
                @if (form.get('name')?.invalid && form.get('name')?.touched) {
                  <mat-error>Name is required</mat-error>
                }
              </mat-form-field>

              <div class="two-col">
                <mat-form-field appearance="outline">
                  <mat-label>Phone</mat-label>
                  <input matInput formControlName="phone" placeholder="+91 9876543210" />
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Email</mat-label>
                  <input matInput type="email" formControlName="email" placeholder="customer@example.com" />
                  @if (form.get('email')?.invalid && form.get('email')?.touched) {
                    <mat-error>Invalid email format</mat-error>
                  }
                </mat-form-field>
              </div>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Address</mat-label>
                <textarea matInput formControlName="address" rows="3" placeholder="Full address"></textarea>
              </mat-form-field>

              <div class="form-actions">
                <button mat-stroked-button type="button" routerLink="/customers">Cancel</button>
                <button mat-flat-button color="primary" type="submit" [disabled]="saving()">
                  @if (saving()) {
                    <mat-spinner diameter="20"></mat-spinner>
                  } @else {
                    {{ isEdit() ? 'Update' : 'Save' }}
                  }
                </button>
              </div>
            </form>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .form-page { max-width: 700px; }
    .page-header { display: flex; align-items: center; gap: 8px; margin-bottom: 24px; }
    .page-header h2 { margin: 0; font-size: 1.8rem; }
    .loading-center { display: flex; justify-content: center; padding: 48px; }
    .form-card { border-radius: 12px !important; }
    .customer-form { display: flex; flex-direction: column; gap: 8px; padding: 8px 0; }
    .full-width { width: 100%; }
    .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .two-col mat-form-field { width: 100%; }
    .form-actions { display: flex; gap: 12px; justify-content: flex-end; padding-top: 8px; }
    @media (max-width: 600px) { .two-col { grid-template-columns: 1fr; } }
  `]
})
export class CustomerFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private customerSvc = inject(CustomerService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  isEdit = signal(false);
  loadingData = signal(false);
  saving = signal(false);
  customerId = signal<string | null>(null);

  form = this.fb.group({
    name: ['', Validators.required],
    phone: [''],
    email: ['', Validators.email],
    address: ['']
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.customerId.set(id);
      this.loadCustomer(id);
    }
  }

  loadCustomer(id: string): void {
    this.loadingData.set(true);
    this.customerSvc.getById(id).subscribe({
      next: (c) => {
        this.form.patchValue(c);
        this.loadingData.set(false);
      },
      error: () => {
        this.snackBar.open('Failed to load customer', 'Close', { duration: 3000 });
        this.loadingData.set(false);
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    const data = {
      id: this.customerId() ?? undefined,
      ...this.form.value as any
    };
    this.customerSvc.save(data).subscribe({
      next: () => {
        this.saving.set(false);
        this.snackBar.open(`Customer ${this.isEdit() ? 'updated' : 'created'} successfully!`, 'Close', { duration: 3000 });
        this.router.navigate(['/customers']);
      },
      error: (err) => {
        this.saving.set(false);
        const msg = err?.error?.message || 'Failed to save customer.';
        this.snackBar.open(msg, 'Close', { duration: 4000, panelClass: 'error-snack' });
      }
    });
  }
}
