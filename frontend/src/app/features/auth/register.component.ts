import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="auth-card">
      <div class="auth-header">
        <h2>Join AUGMONT</h2>
        <p>Create your admin account</p>
      </div>

      <div *ngIf="errorMessage" class="error-alert">
        {{ errorMessage }}
      </div>

      <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label for="email">Email</label>
          <div class="input-wrapper">
            <input type="email" id="email" formControlName="email" placeholder="admin@example.com">
          </div>
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <div class="input-wrapper password-wrapper">
            <input [type]="showPassword ? 'text' : 'password'" id="password" formControlName="password" placeholder="••••••••">
            <button type="button" class="toggle-password" (click)="togglePassword()">
              <svg *ngIf="!showPassword" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              <svg *ngIf="showPassword" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
            </button>
          </div>
        </div>

        <button type="submit" [disabled]="registerForm.invalid || isLoading" class="btn-submit">
          {{ isLoading ? 'Creating Account...' : 'Create Account' }}
        </button>
      </form>
      
      <div class="auth-footer">
        Already have an account? <a routerLink="/login">Sign in</a>
      </div>
    </div>
  `,
  styles: [`
    /* Same styles as login for consistency */
    .auth-card {
      background: rgba(255, 255, 255, 0.03);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      padding: 3rem;
      width: 100%;
      max-width: 420px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }

    .auth-header {
      text-align: center;
      margin-bottom: 2.5rem;
    }

    .auth-header h2 {
      color: #f8fafc;
      font-size: 2rem;
      font-weight: 700;
      margin: 0 0 0.5rem 0;
      letter-spacing: 0.05em;
      font-family: 'Playfair Display', serif;
    }

    .auth-header p {
      color: #94a3b8;
      margin: 0;
      font-size: 0.95rem;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    label {
      display: block;
      color: #cbd5e1;
      font-size: 0.85rem;
      font-weight: 500;
      margin-bottom: 0.5rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .input-wrapper {
      position: relative;
    }

    .input-wrapper input {
      width: 100%;
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #f8fafc;
      padding: 0.875rem 1rem;
      border-radius: 10px;
      font-size: 1rem;
      transition: all 0.3s ease;
    }

    .password-wrapper input {
      padding-right: 2.5rem;
    }

    .toggle-password {
      position: absolute;
      right: 0.5rem;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      padding: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color 0.2s;
    }

    .toggle-password:hover {
      color: #f8fafc;
    }

    .toggle-password:focus {
      outline: none;
    }

    .input-wrapper input:focus {
      outline: none;
      border-color: #d4af37;
      background: rgba(15, 23, 42, 0.9);
      box-shadow: 0 0 0 4px rgba(212, 175, 55, 0.1);
    }

    .input-wrapper input::placeholder {
      color: #475569;
    }

    .btn-submit {
      width: 100%;
      background: #d4af37;
      color: #fff;
      border: none;
      padding: 0.875rem;
      border-radius: 10px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      margin-top: 1rem;
      transition: all 0.3s ease;
      box-shadow: 0 4px 14px 0 rgba(212, 175, 55, 0.39);
    }

    .btn-submit:hover:not(:disabled) {
      background: #b8962c;
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(212, 175, 55, 0.4);
    }

    .btn-submit:disabled {
      background: #475569;
      cursor: not-allowed;
      box-shadow: none;
      color: #94a3b8;
    }

    .error-alert {
      background: rgba(239, 68, 68, 0.1);
      border-left: 4px solid #ef4444;
      color: #fca5a5;
      padding: 1rem;
      border-radius: 6px;
      margin-bottom: 1.5rem;
      font-size: 0.9rem;
    }

    .auth-footer {
      text-align: center;
      margin-top: 2rem;
      color: #94a3b8;
      font-size: 0.9rem;
    }

    .auth-footer a {
      color: #d4af37;
      text-decoration: none;
      font-weight: 600;
      transition: color 0.2s;
    }

    .auth-footer a:hover {
      color: #f8fafc;
    }
  `]
})
export class RegisterComponent {
  registerForm: FormGroup;
  errorMessage = '';
  isLoading = false;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      
      this.authService.register(this.registerForm.value).subscribe({
        next: () => {
          // Log them in immediately after registering
          this.authService.login(this.registerForm.value).subscribe(() => {
            this.router.navigate(['/dashboard']);
          });
        },
        error: (err) => {
          this.errorMessage = err.error?.error || 'Registration failed.';
          this.isLoading = false;
        }
      });
    }
  }
}
