import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'signup',
    loadComponent: () => import('./features/auth/signup/signup.component').then(m => m.SignupComponent)
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./shared/components/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'customers',
        loadComponent: () => import('./features/customers/customer-list/customer-list.component').then(m => m.CustomerListComponent)
      },
      {
        path: 'customers/new',
        loadComponent: () => import('./features/customers/customer-form/customer-form.component').then(m => m.CustomerFormComponent)
      },
      {
        path: 'customers/edit/:id',
        loadComponent: () => import('./features/customers/customer-form/customer-form.component').then(m => m.CustomerFormComponent)
      },
      {
        path: 'subscription',
        loadComponent: () => import('./features/subscription/subscription.component').then(m => m.SubscriptionComponent)
      },
      {
        path: 'assistant',
        loadComponent: () => import('./features/assistant/assistant.component').then(m => m.AssistantComponent)
      }
    ]
  },
  { path: '**', redirectTo: '/dashboard' }
];
