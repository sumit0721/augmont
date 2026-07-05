import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { CategoryService } from '../../core/services/category.service';

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="form-container">
      <h2>{{ isEditMode ? 'Edit Category' : 'Create Category' }}</h2>
      <div *ngIf="errorMessage" class="error-msg">{{ errorMessage }}</div>
      
      <form [formGroup]="categoryForm" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label for="name">Name</label>
          <input type="text" id="name" formControlName="name" class="form-control" />
        </div>
        
        <div class="actions">
          <button type="button" routerLink="/categories" class="btn btn-outline">Cancel</button>
          <button type="submit" [disabled]="categoryForm.invalid || isLoading" class="btn btn-primary ml-2">
            {{ isLoading ? 'Saving...' : 'Save' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .form-container { max-width: 500px; margin: 2rem auto; padding: 2rem; border: 1px solid #ccc; border-radius: 8px; }
    .form-group { margin-bottom: 1rem; }
    .form-control { width: 100%; padding: 0.5rem; margin-top: 0.25rem; box-sizing: border-box; }
    .actions { margin-top: 1.5rem; display: flex; justify-content: flex-end; }
    .btn { padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; text-decoration: none; border: none; }
    .btn-primary { background-color: #007bff; color: white; }
    .btn-outline { background: white; border: 1px solid #ccc; color: #333; }
    .btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .ml-2 { margin-left: 0.5rem; }
    .error-msg { color: red; margin-bottom: 1rem; }
  `]
})
export class CategoryFormComponent implements OnInit {
  categoryForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  isEditMode = false;
  categoryId!: number;

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.categoryForm = this.fb.group({
      name: ['', Validators.required]
    });

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.categoryId = +id;
        // Not fetching by ID here to keep it simple, we can rely on list or add getById to service if needed
        // For now just basic edit
      }
    });
  }

  onSubmit(): void {
    if (this.categoryForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      
      const request$ = this.isEditMode
        ? this.categoryService.update(this.categoryId, this.categoryForm.value)
        : this.categoryService.create(this.categoryForm.value);

      request$.subscribe({
        next: () => {
          this.router.navigate(['/categories']);
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err.error?.error || 'Operation failed';
        }
      });
    }
  }
}
