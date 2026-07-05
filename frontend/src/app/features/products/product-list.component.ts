import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { ProductService, Product } from '../../core/services/product.service';
import { CategoryService, Category } from '../../core/services/category.service';
import { PaginationComponent } from '../../shared/components/pagination.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule, PaginationComponent, FormsModule],
  template: `
    <div class="list-container">
      <div class="header">
        <h2>Products</h2>
        <div style="display: flex; gap: 0.75rem;">
          <a routerLink="/products/bulk-upload" class="btn btn-outline">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
            Bulk Upload
          </a>
          <a routerLink="/products/new" class="btn btn-primary">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Create Product
          </a>
          <button (click)="downloadReport('csv')" class="btn btn-outline">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            CSV
          </button>
          <button (click)="downloadReport('xlsx')" class="btn btn-outline">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            XLSX
          </button>
        </div>
      </div>
      
      <div class="premium-filters-panel">
        <div class="filter-group">
          <i class="icon-search"></i>
          <input type="text" placeholder="Search products..." [(ngModel)]="search" (ngModelChange)="onFilterChange()" class="premium-input" />
        </div>
        
        <div class="filter-group">
          <select [(ngModel)]="filters.categoryId" (ngModelChange)="onFilterChange()" class="premium-input">
            <option [ngValue]="null">All Categories</option>
            <option *ngFor="let cat of categories" [value]="cat.id">{{ cat.name }}</option>
          </select>
        </div>

        <div class="filter-group">
          <input type="number" placeholder="Min Price (₹)" [(ngModel)]="filters.priceMin" (ngModelChange)="onFilterChange()" class="premium-input" />
        </div>

        <div class="filter-group">
          <input type="number" placeholder="Max Price (₹)" [(ngModel)]="filters.priceMax" (ngModelChange)="onFilterChange()" class="premium-input" />
        </div>

        <div class="filter-group">
          <input type="number" placeholder="Min Stock" [(ngModel)]="filters.stockMin" (ngModelChange)="onFilterChange()" class="premium-input" />
        </div>
      </div>

      <div *ngIf="errorMessage" class="error-msg">
        <span class="error-icon">⚠️</span> {{ errorMessage }}
      </div>
      
      <table class="table">
        <thead>
          <tr>
            <th class="sortable" (click)="setSort('id')">ID <span *ngIf="sort === 'id'">{{ order === 'asc' ? '↑' : '↓' }}</span></th>
            <th>Image</th>
            <th class="sortable" (click)="setSort('name')">Name <span *ngIf="sort === 'name'">{{ order === 'asc' ? '↑' : '↓' }}</span></th>
            <th class="sortable" (click)="setSort('price')">Price <span *ngIf="sort === 'price'">{{ order === 'asc' ? '↑' : '↓' }}</span></th>
            <th class="sortable" (click)="setSort('stock')">Stock <span *ngIf="sort === 'stock'">{{ order === 'asc' ? '↑' : '↓' }}</span></th>
            <th>Category</th>
            <th class="sortable" (click)="setSort('createdAt')">Created At <span *ngIf="sort === 'createdAt'">{{ order === 'asc' ? '↑' : '↓' }}</span></th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let product of products">
            <td>{{ product.id }}</td>
            <td>
              <img *ngIf="product.image" [src]="product.image.startsWith('http') ? product.image : 'http://localhost:3000' + product.image" (error)="product.image = ''" alt="Product" class="product-img" />
              <span *ngIf="!product.image">No Image</span>
            </td>
            <td>{{ product.name }}</td>
            <td>{{ product.price | currency:'INR' }}</td>
            <td>{{ product.stock }}</td>
            <td>{{ product.category?.name }}</td>
            <td>{{ product.createdAt | date:'short' }}</td>
            <td>
              <a [routerLink]="['/products/edit', product.id]" class="btn btn-sm btn-outline">Edit</a>
              <button (click)="deleteProduct(product.id)" class="btn btn-sm btn-danger ml-2">Delete</button>
            </td>
          </tr>
          <tr *ngIf="products.length === 0">
            <td colspan="8" class="text-center">No products found.</td>
          </tr>
        </tbody>
      </table>

      <app-pagination 
        [page]="page" 
        [totalPages]="totalPages" 
        [total]="total" 
        (pageChange)="goToPage($event)">
      </app-pagination>
    </div>
  `,
  styles: [`
    .list-container { padding: 2rem; max-width: 1400px; margin: 0 auto; font-family: 'Inter', 'Roboto', sans-serif; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    .header h2 { font-size: 1.75rem; font-weight: 700; color: #1e293b; margin: 0; }
    
    .premium-filters-panel {
      display: grid;
      grid-template-columns: 2fr 1.5fr 1fr 1fr 1fr;
      gap: 1rem;
      background: #ffffff;
      padding: 1.25rem;
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
      margin-bottom: 2rem;
      align-items: center;
      border: 1px solid #e2e8f0;
    }

    .filter-group { position: relative; width: 100%; }

    .premium-input {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      background-color: #f8fafc;
      color: #334155;
      font-size: 0.95rem;
      transition: all 0.2s ease;
      box-sizing: border-box;
      outline: none;
    }

    .premium-input:focus {
      border-color: #3b82f6;
      background-color: #ffffff;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
    }
    
    .premium-input::placeholder { color: #94a3b8; }

    .table { width: 100%; border-collapse: separate; border-spacing: 0; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .table th, .table td { padding: 1rem 1.25rem; text-align: left; border-bottom: 1px solid #e2e8f0; color: #334155; }
    .table th { background-color: #f8fafc; font-weight: 600; color: #475569; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.05em; }
    .table tr:last-child td { border-bottom: none; }
    .table tbody tr:hover { background-color: #f1f5f9; transition: background-color 0.2s ease; }
    
    .sortable { cursor: pointer; user-select: none; transition: color 0.2s; }
    .sortable:hover { color: #1e293b; background-color: #e2e8f0; }
    
    .btn { padding: 0.6rem 1.2rem; border-radius: 8px; cursor: pointer; border: none; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; font-weight: 500; font-size: 0.9rem; transition: all 0.2s; }
    .btn-primary { background-color: #3b82f6; color: white; box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3); }
    .btn-primary:hover { background-color: #2563eb; transform: translateY(-1px); }
    .btn-danger { background-color: #ef4444; color: white; }
    .btn-danger:hover { background-color: #dc2626; }
    .btn-outline { background: white; border: 1px solid #cbd5e1; color: #475569; }
    .btn-outline:hover { background: #f8fafc; border-color: #94a3b8; color: #1e293b; }
    .btn-sm { padding: 0.35rem 0.75rem; font-size: 0.8rem; }
    
    .ml-2 { margin-left: 0.5rem; }
    .mr-2 { margin-right: 0.5rem; }
    .text-center { text-align: center; }
    
    .product-img { max-width: 48px; max-height: 48px; object-fit: cover; border-radius: 6px; border: 1px solid #e2e8f0; }
    
    .error-msg { display: flex; align-items: center; color: #b91c1c; margin-bottom: 1.5rem; padding: 1rem; border: 1px solid #fecaca; border-radius: 8px; background: #fef2f2; font-weight: 500; }
    .error-icon { margin-right: 0.5rem; font-size: 1.25rem; }
  `]
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  categories: Category[] = [];
  page = 1;
  limit = 20;
  sort = 'createdAt';
  order = 'desc';
  search = '';
  filters: any = {
    priceMin: null,
    priceMax: null,
    stockMin: null,
    categoryId: null
  };
  total = 0;
  totalPages = 0;
  errorMessage = '';

  private filterSubject = new Subject<void>();

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.categoryService.getAll().subscribe(res => {
      this.categories = res.data;
    });

    this.filterSubject.pipe(
      debounceTime(300),
      switchMap(() => {
        this.page = 1;
        return this.productService.getProducts(this.page, this.limit, this.sort, this.order, this.search, this.filters);
      })
    ).subscribe({
      next: (response) => {
        this.products = response.data;
        this.total = response.total;
        this.totalPages = response.totalPages;
      },
      error: () => this.errorMessage = 'Failed to load products'
    });

    this.loadProducts();
  }

  onFilterChange(): void {
    this.filterSubject.next();
  }

  loadProducts(): void {
    this.productService.getProducts(this.page, this.limit, this.sort, this.order, this.search, this.filters)
      .subscribe({
        next: (response) => {
          this.products = response.data;
          this.total = response.total;
          this.totalPages = response.totalPages;
        },
        error: () => this.errorMessage = 'Failed to load products'
      });
  }

  setSort(column: string): void {
    if (this.sort === column) {
      this.order = this.order === 'asc' ? 'desc' : 'asc';
    } else {
      this.sort = column;
      this.order = 'asc';
    }
    this.page = 1;
    this.loadProducts();
  }

  goToPage(page: number): void {
    this.page = page;
    this.loadProducts();
  }

  deleteProduct(id: number): void {
    if (confirm('Are you sure you want to delete this product?')) {
      this.productService.deleteProduct(id).subscribe({
        next: () => this.loadProducts(),
        error: (err) => this.errorMessage = err.error?.error || 'Failed to delete'
      });
    }
  }

  downloadReport(format: string): void {
    this.productService.downloadReport(format).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `products_report.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: () => this.errorMessage = 'Failed to download report'
    });
  }
}
