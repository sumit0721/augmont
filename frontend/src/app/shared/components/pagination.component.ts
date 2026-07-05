import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="pagination-container" *ngIf="totalPages > 1">
      <button 
        class="btn btn-outline" 
        [disabled]="page === 1" 
        (click)="changePage(page - 1)">
        Previous
      </button>
      
      <span class="page-info">Page {{ page }} of {{ totalPages }} ({{ total }} items)</span>
      
      <button 
        class="btn btn-outline" 
        [disabled]="page === totalPages" 
        (click)="changePage(page + 1)">
        Next
      </button>
    </div>
  `,
  styles: [`
    .pagination-container { display: flex; align-items: center; justify-content: center; gap: 1rem; margin-top: 1rem; }
    .btn-outline { padding: 0.25rem 0.75rem; background: white; border: 1px solid #ccc; border-radius: 4px; cursor: pointer; }
    .btn-outline:disabled { background: #eee; cursor: not-allowed; }
    .page-info { font-size: 0.9rem; color: #666; }
  `]
})
export class PaginationComponent {
  @Input() page: number = 1;
  @Input() totalPages: number = 1;
  @Input() total: number = 0;
  
  @Output() pageChange = new EventEmitter<number>();

  changePage(newPage: number) {
    if (newPage >= 1 && newPage <= this.totalPages && newPage !== this.page) {
      this.pageChange.emit(newPage);
    }
  }
}
