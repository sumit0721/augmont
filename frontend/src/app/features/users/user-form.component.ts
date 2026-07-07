import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UserService, User } from './user.service';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="page-header">
      <div>
        <h2 class="section-title">{{ isEditMode ? 'Edit User' : 'Add New User' }}</h2>
        <p class="section-subtitle">{{ isEditMode ? 'Update user credentials' : 'Create a new admin user' }}</p>
      </div>
    </div>

    <div class="card form-container">
      <form [formGroup]="userForm" (ngSubmit)="onSubmit()">
        
        <div class="form-group">
          <label for="email">Email Address</label>
          <input type="email" id="email" formControlName="email" class="form-control" placeholder="admin@example.com">
          <div *ngIf="userForm.get('email')?.invalid && userForm.get('email')?.touched" class="error-msg">
            Valid email is required.
          </div>
        </div>

        <div class="form-group">
          <label for="password">Password {{ isEditMode ? '(Leave blank to keep current)' : '' }}</label>
          <input type="password" id="password" formControlName="password" class="form-control" placeholder="••••••••">
          <div *ngIf="userForm.get('password')?.invalid && userForm.get('password')?.touched" class="error-msg">
            Password must be at least 6 characters.
          </div>
        </div>

        <div class="form-actions">
          <a routerLink="/users" class="btn-secondary">Cancel</a>
          <button type="submit" [disabled]="userForm.invalid" class="btn-primary">
            {{ isEditMode ? 'Update User' : 'Create User' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .page-header { margin-bottom: 2rem; }
    .section-title { font-size: 1.75rem; font-weight: 700; color: #1e293b; margin: 0 0 0.25rem 0; font-family: 'Playfair Display', serif; }
    .section-subtitle { color: #64748b; margin: 0; font-size: 0.95rem; }

    .card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
      border: 1px solid #f1f5f9;
      overflow: hidden;
      max-width: 600px;
    }

    .form-container {
      padding: 2.5rem;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #475569;
      font-size: 0.9rem;
    }

    .form-control {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      font-size: 1rem;
      color: #0f172a;
      transition: all 0.2s;
      background-color: #f8fafc;
    }

    .form-control:focus {
      outline: none;
      border-color: #d4af37;
      background-color: #fff;
      box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
    }

    .error-msg {
      color: #ef4444;
      font-size: 0.85rem;
      margin-top: 0.5rem;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 2.5rem;
      padding-top: 1.5rem;
      border-top: 1px solid #f1f5f9;
    }

    .btn-secondary {
      background-color: #f1f5f9;
      color: #475569;
      padding: 0.6rem 1.5rem;
      border-radius: 9999px;
      text-decoration: none;
      font-weight: 600;
      transition: all 0.2s;
    }
    .btn-secondary:hover { background-color: #e2e8f0; }

    .btn-primary {
      background-color: #d4af37;
      color: #fff;
      border: none;
      padding: 0.6rem 1.5rem;
      border-radius: 9999px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.2s ease;
      box-shadow: 0 4px 6px -1px rgba(212, 175, 55, 0.4);
    }
    .btn-primary:hover:not(:disabled) {
      background-color: #b8962c;
      transform: translateY(-1px);
    }
    .btn-primary:disabled {
      background-color: #cbd5e1;
      cursor: not-allowed;
      box-shadow: none;
    }
  `]
})
export class UserFormComponent implements OnInit {
  userForm: FormGroup;
  isEditMode = false;
  userId?: number;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.userForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.minLength(6)]] // Password only required on creation
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.userId = +id;
      // If editing, password is not required
      this.userService.getUser(this.userId).subscribe(user => {
        this.userForm.patchValue({ email: user.email });
      });
    } else {
      // If creating, password is required
      this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
      this.userForm.get('password')?.updateValueAndValidity();
    }
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      const userData: User = this.userForm.value;
      
      // Clean up empty password if editing
      if (this.isEditMode && !userData.password) {
        delete userData.password;
      }

      if (this.isEditMode) {
        this.userService.updateUser(this.userId!, userData).subscribe(() => {
          this.router.navigate(['/users']);
        });
      } else {
        this.userService.createUser(userData).subscribe(() => {
          this.router.navigate(['/users']);
        });
      }
    }
  }
}
