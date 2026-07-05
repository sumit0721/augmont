import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CategoryService, Category } from '../../core/services/category.service';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="list-container">
      <div class="header">
        <h2>Categories</h2>
        <a routerLink="/categories/new" class="btn btn-primary">Create Category</a>
      </div>
      
      <div *ngIf="errorMessage" class="error-msg">{{ errorMessage }}</div>
      
      <table class="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Created At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let category of categories">
            <td>{{ category.id }}</td>
            <td>{{ category.name }}</td>
            <td>{{ category.createdAt | date:'short' }}</td>
            <td>
              <a [routerLink]="['/categories/edit', category.id]" class="btn btn-sm btn-outline">Edit</a>
              <button (click)="deleteCategory(category.id)" class="btn btn-sm btn-danger ml-2">Delete</button>
            </td>
          </tr>
          <tr *ngIf="categories.length === 0">
            <td colspan="4" class="text-center">No categories found.</td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .list-container { padding: 2rem; max-width: 1200px; margin: 0 auto; font-family: 'Inter', 'Roboto', sans-serif; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    .header h2 { font-size: 1.75rem; font-weight: 700; color: #1e293b; margin: 0; }
    
    .table { width: 100%; border-collapse: separate; border-spacing: 0; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 2rem; }
    .table th, .table td { padding: 1rem 1.25rem; text-align: left; border-bottom: 1px solid #e2e8f0; color: #334155; }
    .table th { background-color: #f8fafc; font-weight: 600; color: #475569; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.05em; }
    .table tr:last-child td { border-bottom: none; }
    .table tbody tr:hover { background-color: #f1f5f9; transition: background-color 0.2s ease; }
    
    .btn-sm { padding: 0.35rem 0.75rem; font-size: 0.8rem; }
    .ml-2 { margin-left: 0.5rem; }
    .text-center { text-align: center; }
    .error-msg { display: flex; align-items: center; color: #b91c1c; margin-bottom: 1.5rem; padding: 1rem; border: 1px solid #fecaca; border-radius: 8px; background: #fef2f2; font-weight: 500; }
  `]
})
export class CategoryListComponent implements OnInit {
  categories: Category[] = [];
  errorMessage = '';

  constructor(private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoryService.getAll().subscribe({
      next: (res) => {
        this.categories = res.data;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load categories';
      }
    });
  }

  deleteCategory(id: number): void {
    if (confirm('Are you sure you want to delete this category?')) {
      this.categoryService.delete(id).subscribe({
        next: () => {
          this.loadCategories();
        },
        error: (err) => {
          this.errorMessage = err.error?.error || 'Failed to delete category';
        }
      });
    }
  }
}
