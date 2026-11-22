import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatListModule, MatIconModule],
  template: `
    <mat-nav-list class="nav-list">
      @for (item of navItems; track item.route) {
        <a mat-list-item [routerLink]="item.route" routerLinkActive="active-link">
          <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
          <span matListItemTitle>{{ item.label }}</span>
        </a>
      }
    </mat-nav-list>
  `,
  styles: [`
    .nav-list { padding-top: 8px; }
    .active-link { background: rgba(63,81,181,0.1); border-right: 3px solid #3f51b5; }
    .active-link mat-icon { color: #3f51b5; }
  `]
})
export class SidenavComponent {
  navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    { label: 'Customers', icon: 'people', route: '/customers' },
    { label: 'Subscription', icon: 'credit_card', route: '/subscription' },
    { label: 'AI Assistant', icon: 'chat', route: '/assistant' }
  ];
}
