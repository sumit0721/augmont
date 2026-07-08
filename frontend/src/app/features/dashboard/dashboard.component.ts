import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatsService, DashboardStats } from '../../core/services/stats.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-header">
      <div>
        <h2 class="section-title">Dashboard</h2>
        <p class="section-subtitle">Overview of your store's performance</p>
      </div>
    </div>

    <div class="metrics-grid" *ngIf="!isLoading && stats">
      <div class="metric-card">
        <div class="metric-icon users">
          <span>&#64;</span>
        </div>
        <div class="metric-info">
          <h3>Total Users</h3>
          <p class="metric-value">{{ stats.totalUsers }}</p>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-icon categories">
          <span>#</span>
        </div>
        <div class="metric-info">
          <h3>Categories</h3>
          <p class="metric-value">{{ stats.categories }}</p>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-icon products">
          <span>+</span>
        </div>
        <div class="metric-info">
          <h3>Total Products</h3>
          <p class="metric-value">{{ stats.totalProducts }}</p>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-icon stock">
          <span>📦</span>
        </div>
        <div class="metric-info">
          <h3>Total Stock</h3>
          <p class="metric-value">{{ stats.totalStock | number }}</p>
        </div>
      </div>
    </div>
    
    <div *ngIf="isLoading" class="loading-state">
      <p>Loading statistics...</p>
    </div>
    <div *ngIf="error" class="error-state">
      <p>{{ error }}</p>
    </div>
  `,
  styles: [`
    .dashboard-header {
      margin-bottom: 2.5rem;
    }
    
    .section-title {
      font-size: 1.75rem;
      font-weight: 700;
      color: #1e293b;
      margin: 0 0 0.25rem 0;
      font-family: 'Playfair Display', serif; /* Elegant serif for titles */
    }
    
    .section-subtitle {
      color: #64748b;
      margin: 0;
      font-size: 0.95rem;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1.5rem;
    }

    .metric-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1.25rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
      border: 1px solid #f1f5f9;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      position: relative;
      overflow: hidden;
    }
    
    .metric-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      width: 4px;
      background-color: #d4af37;
      border-top-left-radius: 12px;
      border-bottom-left-radius: 12px;
    }

    .metric-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04);
    }

    .metric-icon {
      width: 50px;
      height: 50px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      font-weight: 700;
      color: #d4af37;
      background-color: rgba(212, 175, 55, 0.1);
    }

    .metric-info h3 {
      margin: 0;
      font-size: 0.875rem;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .metric-info .metric-value {
      margin: 0.25rem 0 0 0;
      font-size: 1.75rem;
      font-weight: 700;
      color: #0f172a;
    }
    
    .loading-state, .error-state {
      padding: 2rem;
      text-align: center;
      color: #64748b;
    }
    .error-state {
      color: #ef4444;
    }
  `]
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats | null = null;
  isLoading = true;
  error = '';
  
  constructor(private statsService: StatsService) {}
  
  ngOnInit(): void {
    this.statsService.getDashboardStats().subscribe({
      next: (res) => {
        this.stats = res.data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load stats', err);
        this.error = 'Failed to load dashboard statistics.';
        this.isLoading = false;
      }
    });
  }
}
