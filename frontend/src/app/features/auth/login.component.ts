import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="auth-card">
      <div class="auth-header">
        <h2>AUGMONT Admin</h2>
        <p>Sign in to your account</p>
      </div>

      <div *ngIf="errorMessage" class="error-alert">
        {{ errorMessage }}
      </div>

      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label for="email">Email</label>
          <div class="input-wrapper">
            <input type="email" id="email" formControlName="email" placeholder="admin@example.com">
          </div>
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <div class="input-wrapper">
            <input type="password" id="password" formControlName="password" placeholder="••••••••">
          </div>
        </div>

        <button type="submit" [disabled]="loginForm.invalid || isLoading" class="btn-submit">
          {{ isLoading ? 'Signing in...' : 'Sign In' }}
        </button>
      </form>
      
      <div class="auth-footer">
        Don't have an account? <a routerLink="/register">Register here</a>
      </div>
    </div>
  `,
  styles: [`
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
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage = '';
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      
      this.authService.login(this.loginForm.value).subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.errorMessage = err.error?.error || 'Invalid credentials.';
          this.isLoading = false;
        }
      });
    }
  }
}
