import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CategoryService, Category } from '../../core/services/category.service';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="form-container">
      <h2>{{ isEditMode ? 'Edit Product' : 'Create Product' }}</h2>
      <div *ngIf="errorMessage" class="error-msg">{{ errorMessage }}</div>
      
      <form [formGroup]="productForm" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label for="name">Name</label>
          <input type="text" id="name" formControlName="name" class="form-control" />
        </div>
        
        <div class="form-group">
          <label for="price">Price</label>
          <input type="number" step="0.01" id="price" formControlName="price" class="form-control" />
        </div>
        
        <div class="form-group">
          <label for="categoryId">Category</label>
          <select id="categoryId" formControlName="categoryId" class="form-control">
            <option [ngValue]="null">Select Category</option>
            <option *ngFor="let cat of categories" [value]="cat.id">{{ cat.name }}</option>
          </select>
        </div>

        <div class="form-group">
          <label for="stock">Stock</label>
          <input type="number" id="stock" formControlName="stock" class="form-control" />
        </div>

        <div class="form-group">
          <label>Image Upload Options (Choose One)</label>
          <div style="margin-top: 0.5rem; display: flex; flex-direction: column; gap: 0.5rem;">
            <input type="text" formControlName="imageUrl" placeholder="Image URL (e.g. https://...)" class="form-control" />
            <div style="text-align: center;">OR</div>
            <input type="file" id="image" (change)="onFileSelected($event)" class="form-control" accept="image/*" />
          </div>
        </div>
        
        <div class="actions">
          <button type="button" routerLink="/products" class="btn btn-outline">Cancel</button>
          <button type="submit" [disabled]="productForm.invalid || isLoading" class="btn btn-primary ml-2">
            {{ isLoading ? 'Saving...' : 'Save' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .form-container { max-width: 500px; margin: 2rem auto; padding: 2.5rem; background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); font-family: 'Inter', sans-serif; }
    .form-container h2 { margin-top: 0; color: #1e293b; font-weight: 700; margin-bottom: 1.5rem; }
    .form-group { margin-bottom: 1.5rem; }
    .form-group label { display: block; margin-bottom: 0.5rem; font-weight: 600; color: #475569; font-size: 0.9rem; }
    .actions { margin-top: 2rem; display: flex; justify-content: flex-end; gap: 1rem; }
    .error-msg { display: flex; align-items: center; color: #b91c1c; margin-bottom: 1.5rem; padding: 1rem; border: 1px solid #fecaca; border-radius: 8px; background: #fef2f2; font-weight: 500; }
  `]
})
export class ProductFormComponent implements OnInit {
  productForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  isEditMode = false;
  productId!: number;
  categories: Category[] = [];
  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private categoryService: CategoryService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      price: [null, [Validators.required, Validators.min(0.01)]],
      categoryId: [null, Validators.required],
      stock: [0, [Validators.required, Validators.min(0)]],
      imageUrl: ['']
    });

    this.categoryService.getAll().subscribe(res => {
      this.categories = res.data;
    });

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.productId = +id;
        this.productService.getProductById(this.productId).subscribe(res => {
          this.productForm.patchValue({
            name: res.data.name,
            price: res.data.price,
            categoryId: res.data.categoryId,
            stock: (res.data as any).stock || 0,
            imageUrl: res.data.image?.startsWith('http') ? res.data.image : ''
          });
        });
      }
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  onSubmit(): void {
    if (this.productForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      
      const formData = new FormData();
      formData.append('name', this.productForm.value.name);
      formData.append('price', this.productForm.value.price);
      formData.append('categoryId', this.productForm.value.categoryId);
      formData.append('stock', this.productForm.value.stock);
      
      if (this.selectedFile) {
        formData.append('image', this.selectedFile);
      } else if (this.productForm.value.imageUrl) {
        formData.append('imageUrl', this.productForm.value.imageUrl);
      }
      
      const request$ = this.isEditMode
        ? this.productService.updateProduct(this.productId, formData)
        : this.productService.createProduct(formData);

      request$.subscribe({
        next: () => {
          this.router.navigate(['/products']);
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err.error?.error || 'Operation failed';
        }
      });
    }
  }
}
