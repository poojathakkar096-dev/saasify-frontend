import { Component, inject, output } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [MatToolbarModule, MatButtonModule, MatIconModule, MatMenuModule, MatDividerModule],
  template: `
    <mat-toolbar color="primary" class="navbar">
      <button mat-icon-button (click)="menuToggle.emit()" class="menu-btn">
        <mat-icon>menu</mat-icon>
      </button>
      <span class="logo">SaaSify</span>
      <span class="spacer"></span>
      <button mat-icon-button [matMenuTriggerFor]="userMenu">
        <mat-icon>account_circle</mat-icon>
      </button>
      <mat-menu #userMenu="matMenu">
        <div class="user-info">
          <div class="user-name">{{ auth.currentUser()?.fullName }}</div>
          <div class="user-email">{{ auth.currentUser()?.email }}</div>
        </div>
        <mat-divider></mat-divider>
        <button mat-menu-item (click)="auth.logout()">
          <mat-icon>logout</mat-icon> Logout
        </button>
      </mat-menu>
    </mat-toolbar>
  `,
  styles: [`
    .navbar { position: fixed; top: 0; left: 0; right: 0; z-index: 100; }
    .logo { font-size: 1.3rem; font-weight: 700; letter-spacing: 0.5px; }
    .spacer { flex: 1; }
    .user-info { padding: 12px 16px; }
    .user-name { font-weight: 600; }
    .user-email { font-size: 0.8rem; color: #666; }
  `]
})
export class NavbarComponent {
  auth = inject(AuthService);
  menuToggle = output<void>();
}
