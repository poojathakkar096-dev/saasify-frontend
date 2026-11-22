import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { NavbarComponent } from '../navbar/navbar.component';
import { SidenavComponent } from '../sidenav/sidenav.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, MatSidenavModule, NavbarComponent, SidenavComponent],
  template: `
    <app-navbar (menuToggle)="toggleSidenav()" />
    <mat-sidenav-container class="container">
      <mat-sidenav #sidenav [opened]="sidenavOpen()" mode="side" class="sidenav">
        <app-sidenav />
      </mat-sidenav>
      <mat-sidenav-content class="content">
        <router-outlet />
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    :host { display: block; }
    .container { height: 100vh; padding-top: 64px; }
    .sidenav { width: 220px; }
    .content { padding: 24px; }
  `]
})
export class MainLayoutComponent {
  sidenavOpen = signal(true);

  toggleSidenav() {
    this.sidenavOpen.update(v => !v);
  }
}
