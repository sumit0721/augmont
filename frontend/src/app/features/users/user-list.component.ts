import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserService, User } from './user.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page-header">
      <div>
        <h2 class="section-title">Users</h2>
        <p class="section-subtitle">Manage system users and administrators</p>
      </div>
      <a routerLink="/users/new" class="btn-primary">+ Add New User</a>
    </div>

    <div class="card table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Email</th>
            <th>Date Added</th>
            <th class="actions-col">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let user of users">
            <td>#{{ user.id }}</td>
            <td class="font-medium">{{ user.email }}</td>
            <td>{{ user.createdAt | date:'mediumDate' }}</td>
            <td class="actions-col">
              <a [routerLink]="['/users/edit', user.id]" class="btn-icon edit">
                ✎ Edit
              </a>
              <button (click)="deleteUser(user.id!)" class="btn-icon delete">
                ✖ Delete
              </button>
            </td>
          </tr>
          <tr *ngIf="users.length === 0">
            <td colspan="4" class="empty-state">No users found.</td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }
    
    .section-title {
      font-size: 1.75rem;
      font-weight: 700;
      color: #1e293b;
      margin: 0 0 0.25rem 0;
      font-family: 'Playfair Display', serif;
    }
    
    .section-subtitle {
      color: #64748b;
      margin: 0;
      font-size: 0.95rem;
    }

    .btn-primary {
      background-color: #d4af37;
      color: #fff;
      padding: 0.6rem 1.5rem;
      border-radius: 9999px;
      text-decoration: none;
      font-weight: 600;
      transition: all 0.2s ease;
      box-shadow: 0 4px 6px -1px rgba(212, 175, 55, 0.4);
    }

    .btn-primary:hover {
      background-color: #b8962c;
      transform: translateY(-1px);
      box-shadow: 0 6px 8px -1px rgba(212, 175, 55, 0.5);
    }

    .card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
      border: 1px solid #f1f5f9;
      overflow: hidden;
    }

    .table-container {
      width: 100%;
      overflow-x: auto;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }

    .data-table th {
      background-color: #f8fafc;
      padding: 1rem 1.5rem;
      font-size: 0.8rem;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 1px solid #e2e8f0;
    }

    .data-table td {
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid #f1f5f9;
      color: #475569;
      font-size: 0.95rem;
    }

    .data-table tr:last-child td {
      border-bottom: none;
    }
    
    .data-table tr:hover td {
      background-color: #f8fafc;
    }

    .font-medium {
      font-weight: 500;
      color: #0f172a !important;
    }

    .actions-col {
      text-align: right;
    }

    .btn-icon {
      background: transparent;
      border: none;
      cursor: pointer;
      font-size: 0.85rem;
      padding: 0.4rem 0.75rem;
      margin-left: 0.5rem;
      border-radius: 6px;
      font-weight: 500;
      text-decoration: none;
      transition: all 0.2s;
    }

    .btn-icon.edit {
      color: #3b82f6;
      background-color: rgba(59, 130, 246, 0.1);
    }
    .btn-icon.edit:hover {
      background-color: rgba(59, 130, 246, 0.2);
    }

    .btn-icon.delete {
      color: #ef4444;
      background-color: rgba(239, 68, 68, 0.1);
    }
    .btn-icon.delete:hover {
      background-color: rgba(239, 68, 68, 0.2);
    }

    .empty-state {
      text-align: center;
      padding: 3rem !important;
      color: #94a3b8 !important;
      font-style: italic;
    }
  `]
})
export class UserListComponent implements OnInit {
  users: User[] = [];

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe(data => {
      this.users = data;
    });
  }

  deleteUser(id: number): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.userService.deleteUser(id).subscribe(() => {
        this.loadUsers();
      });
    }
  }
}
