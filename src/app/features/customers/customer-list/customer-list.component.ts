import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CustomerService } from '../../../core/services/customer.service';
import { Customer } from '../../../core/models/customer.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [
    RouterLink,
    MatTableModule, MatPaginatorModule, MatSortModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatProgressSpinnerModule, MatTooltipModule
  ],
  template: `
    <div class="page-header">
      <h2>Customers</h2>
      <a mat-flat-button color="primary" routerLink="/customers/new">
        <mat-icon>person_add</mat-icon> Add Customer
      </a>
    </div>

    @if (loading()) {
      <div class="loading-center"><mat-spinner></mat-spinner></div>
    } @else {
      <div class="filter-bar">
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Search customers</mat-label>
          <input matInput (keyup)="applyFilter($event)" placeholder="Name, email, phone..." />
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>
      </div>

      <div class="table-container mat-elevation-z2">
        <table mat-table [dataSource]="dataSource" matSort>
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Name</th>
            <td mat-cell *matCellDef="let c">{{ c.name }}</td>
          </ng-container>
          <ng-container matColumnDef="phone">
            <th mat-header-cell *matHeaderCellDef>Phone</th>
            <td mat-cell *matCellDef="let c">{{ c.phone ?? '—' }}</td>
          </ng-container>
          <ng-container matColumnDef="email">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Email</th>
            <td mat-cell *matCellDef="let c">{{ c.email ?? '—' }}</td>
          </ng-container>
          <ng-container matColumnDef="address">
            <th mat-header-cell *matHeaderCellDef>Address</th>
            <td mat-cell *matCellDef="let c" class="address-cell">{{ c.address ?? '—' }}</td>
          </ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let c">
              <a mat-icon-button [routerLink]="['/customers/edit', c.id]" matTooltip="Edit">
                <mat-icon>edit</mat-icon>
              </a>
              <button mat-icon-button color="warn" (click)="deleteCustomer(c)" matTooltip="Delete">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

          <tr class="mat-row" *matNoDataRow>
            <td class="mat-cell empty-row" [attr.colspan]="displayedColumns.length">
              @if (dataSource.filter) {
                No customers match "{{ dataSource.filter }}"
              } @else {
                No customers yet. Add one!
              }
            </td>
          </tr>
        </table>
        <mat-paginator [pageSizeOptions]="[10, 25, 50]" showFirstLastButtons></mat-paginator>
      </div>
    }
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .page-header h2 { margin: 0; font-size: 1.8rem; }
    .loading-center { display: flex; justify-content: center; padding: 48px; }
    .filter-bar { margin-bottom: 16px; }
    .search-field { width: 320px; }
    .table-container { border-radius: 8px; overflow: hidden; }
    table { width: 100%; }
    .address-cell { max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .empty-row { text-align: center; padding: 32px; color: #888; }
  `]
})
export class CustomerListComponent implements OnInit {
  private customerSvc = inject(CustomerService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  loading = signal(true);
  dataSource = new MatTableDataSource<Customer>([]);
  displayedColumns = ['name', 'phone', 'email', 'address', 'actions'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.loading.set(true);
    this.customerSvc.getAll().subscribe({
      next: (list) => {
        this.dataSource.data = list;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.loading.set(false);
      },
      error: () => {
        this.snackBar.open('Failed to load customers', 'Close', { duration: 3000 });
        this.loading.set(false);
      }
    });
  }

  applyFilter(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.dataSource.filter = value.trim().toLowerCase();
  }

  deleteCustomer(customer: Customer): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Customer',
        message: `Are you sure you want to delete "${customer.name}"? This cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });
    ref.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.customerSvc.delete(customer.id!).subscribe({
        next: () => {
          this.snackBar.open('Customer deleted', 'Close', { duration: 3000 });
          this.loadCustomers();
        },
        error: () => this.snackBar.open('Failed to delete customer', 'Close', { duration: 3000 })
      });
    });
  }
}
