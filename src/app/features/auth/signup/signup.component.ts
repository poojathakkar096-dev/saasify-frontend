import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    ReactiveFormsModule, RouterLink,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatProgressSpinnerModule, MatIconModule
  ],
  template: `
    <div class="auth-container">
      <mat-card class="auth-card">
        <mat-card-header>
          <div class="logo-section">
            <mat-icon class="logo-icon">rocket_launch</mat-icon>
            <h1 class="app-title">SaaSify</h1>
            <p class="subtitle">Create your business account</p>
          </div>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="auth-form">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Business Name</mat-label>
              <input matInput formControlName="businessName" placeholder="Acme Corp" />
              <mat-icon matSuffix>business</mat-icon>
              @if (form.get('businessName')?.invalid && form.get('businessName')?.touched) {
                <mat-error>Business name is required</mat-error>
              }
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Full Name</mat-label>
              <input matInput formControlName="fullName" placeholder="John Doe" />
              <mat-icon matSuffix>person</mat-icon>
              @if (form.get('fullName')?.invalid && form.get('fullName')?.touched) {
                <mat-error>Full name is required</mat-error>
              }
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" placeholder="you@company.com" />
              <mat-icon matSuffix>email</mat-icon>
              @if (form.get('email')?.invalid && form.get('email')?.touched) {
                <mat-error>Valid email is required</mat-error>
              }
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input matInput [type]="showPassword() ? 'text' : 'password'" formControlName="password" />
              <button mat-icon-button matSuffix type="button" (click)="showPassword.update(v => !v)">
                <mat-icon>{{ showPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              @if (form.get('password')?.errors?.['required'] && form.get('password')?.touched) {
                <mat-error>Password is required</mat-error>
              }
              @if (form.get('password')?.errors?.['minlength'] && form.get('password')?.touched) {
                <mat-error>Minimum 6 characters required</mat-error>
              }
            </mat-form-field>
            <button mat-flat-button color="primary" type="submit" class="full-width submit-btn" [disabled]="loading()">
              @if (loading()) {
                <mat-spinner diameter="20"></mat-spinner>
              } @else {
                Create Account
              }
            </button>
          </form>
        </mat-card-content>
        <mat-card-actions class="card-actions">
          <span>Already have an account?</span>
          <a routerLink="/login" class="link">Sign in</a>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: 100vh; display: flex; align-items: center; justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    .auth-card { width: 100%; max-width: 440px; padding: 16px; border-radius: 12px !important; }
    .logo-section { width: 100%; text-align: center; padding: 16px 0; }
    .logo-icon { font-size: 48px; width: 48px; height: 48px; color: #3f51b5; }
    .app-title { margin: 8px 0 4px; font-size: 2rem; font-weight: 700; color: #3f51b5; }
    .subtitle { color: #666; margin: 0; }
    .auth-form { display: flex; flex-direction: column; gap: 4px; margin-top: 16px; }
    .full-width { width: 100%; }
    .submit-btn { height: 48px; font-size: 1rem; margin-top: 8px; }
    .card-actions { display: flex; gap: 8px; justify-content: center; padding: 16px; }
    .link { color: #3f51b5; text-decoration: none; font-weight: 600; }
  `]
})
export class SignupComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  loading = signal(false);
  showPassword = signal(false);

  form = this.fb.group({
    businessName: ['', Validators.required],
    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    const { businessName, fullName, email, password } = this.form.value;
    this.auth.signup({ businessName: businessName!, fullName: fullName!, email: email!, password: password! }).subscribe({
      next: () => {
        this.loading.set(false);
        this.snackBar.open('Account created successfully!', 'Close', { duration: 3000 });
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        const msg = err?.error?.message || 'Signup failed. Please try again.';
        this.snackBar.open(msg, 'Close', { duration: 4000, panelClass: 'error-snack' });
      }
    });
  }
}
