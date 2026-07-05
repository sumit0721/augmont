import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule],
  template: `
    <nav class="navbar" *ngIf="isLoggedIn()">
      <div class="nav-brand">AUGMONT</div>
      <div class="nav-links">
        <a routerLink="/categories" routerLinkActive="active">Categories</a>
        <a routerLink="/products" routerLinkActive="active">Products</a>
        <span class="user-info" *ngIf="currentUser">
          {{ currentUser.email }}
        </span>
        <button (click)="logout()" class="btn btn-logout">Logout</button>
      </div>
    </nav>
    
    <main class="main-content">
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    .navbar { 
      background-color: #0f172a; 
      color: white; 
      padding: 1rem 2.5rem; 
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      position: sticky;
      top: 0;
      z-index: 50;
    }
    .nav-brand { font-size: 1.5rem; font-weight: 700; letter-spacing: 0.05em; color: #f8fafc; }
    .nav-links { display: flex; gap: 1.5rem; align-items: center; }
    .nav-links a { 
      color: #cbd5e1; 
      text-decoration: none; 
      padding: 0.5rem 1rem; 
      border-radius: 9999px; /* pill shape */
      font-weight: 500;
      transition: all 0.2s ease;
    }
    .nav-links a:hover { background-color: #1e293b; color: #f8fafc; }
    .nav-links a.active { background-color: #38bdf8; color: #0f172a; box-shadow: 0 0 10px rgba(56,189,248,0.3); }
    .user-info { margin-left: 1.5rem; margin-right: 1.5rem; color: #94a3b8; font-size: 0.9rem; font-weight: 500; }
    .btn-logout { background-color: transparent; color: #ef4444; border: 1px solid #ef4444; padding: 0.4rem 1rem; border-radius: 9999px; font-weight: 500; transition: all 0.2s; cursor: pointer; }
    .btn-logout:hover { background-color: #ef4444; color: white; box-shadow: 0 4px 6px -1px rgba(239, 68, 68, 0.2); }
    .main-content { padding: 2rem; }
  `]
})
export class AppComponent implements OnInit {
  currentUser: any;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  logout(): void {
    this.authService.logout();
    this.currentUser = null;
    this.router.navigate(['/login']);
  }
}
