import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { switchMap, takeWhile } from 'rxjs/operators';
import { ProductService } from '../../core/services/product.service';

@Component({
  selector: 'app-bulk-upload',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="upload-container">
      <h2>Bulk Upload Products</h2>
      
      <div *ngIf="errorMessage" class="error-msg">{{ errorMessage }}</div>
      
      <div class="upload-box" *ngIf="!isPolling && !jobStatus">
        <input type="file" (change)="onFileSelected($event)" accept=".csv,.xlsx" class="file-input" />
        <button 
          (click)="uploadFile()" 
          [disabled]="!selectedFile || isUploading" 
          class="btn btn-primary mt-3">
          {{ isUploading ? 'Uploading...' : 'Upload File' }}
        </button>
      </div>

      <div class="status-container" *ngIf="isPolling || jobStatus">
        <h3>Upload Status: <span class="badge" [ngClass]="jobStatus?.status">{{ jobStatus?.status || 'Initiating...' }}</span></h3>
        
        <div class="progress-info" *ngIf="jobStatus">
          Processed: {{ jobStatus.processedCount }} / {{ jobStatus.totalCount || '?' }}
        </div>
        
        <div class="errors-list" *ngIf="jobStatus?.errors?.length">
          <h4>Validation Errors ({{ jobStatus.errors.length }})</h4>
          <ul>
            <li *ngFor="let err of jobStatus.errors">
              Row {{ err.row }}: {{ err.message }}
            </li>
          </ul>
        </div>

        <button *ngIf="!isPolling" routerLink="/products" class="btn btn-outline mt-3">Back to Products</button>
      </div>
    </div>
  `,
  styles: [`
    .upload-container { max-width: 600px; margin: 2rem auto; padding: 2.5rem; background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); font-family: 'Inter', sans-serif; }
    .upload-container h2 { margin-top: 0; color: #1e293b; font-weight: 700; margin-bottom: 1.5rem; }
    .upload-box { text-align: center; padding: 3rem; border: 2px dashed #cbd5e1; border-radius: 12px; background: #f8fafc; transition: all 0.2s; }
    .upload-box:hover { border-color: #6366f1; background: #e0e7ff; }
    .file-input { display: block; margin: 0 auto; color: #475569; }
    .status-container { margin-top: 2rem; padding: 1.5rem; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; }
    .status-container h3 { margin-top: 0; color: #1e293b; }
    .badge { padding: 0.35rem 0.75rem; border-radius: 9999px; color: white; text-transform: uppercase; font-size: 0.75rem; font-weight: 600; letter-spacing: 0.05em; }
    .badge.processing { background-color: #f59e0b; color: #fff; }
    .badge.completed { background-color: #10b981; }
    .badge.failed { background-color: #ef4444; }
    .progress-info { font-size: 1.1rem; margin: 1.5rem 0; font-weight: 600; color: #334155; }
    .errors-list { background-color: #fef2f2; border: 1px solid #fca5a5; padding: 1.5rem; border-radius: 8px; max-height: 250px; overflow-y: auto; color: #b91c1c; }
    .errors-list h4 { margin-top: 0; }
    .mt-3 { margin-top: 1.5rem; }
    .error-msg { display: flex; align-items: center; color: #b91c1c; margin-bottom: 1.5rem; padding: 1rem; border: 1px solid #fecaca; border-radius: 8px; background: #fef2f2; font-weight: 500; }
  `]
})
export class BulkUploadComponent implements OnDestroy {
  selectedFile: File | null = null;
  isUploading = false;
  errorMessage = '';
  isPolling = false;
  jobStatus: any = null;
  pollingSub?: Subscription;

  constructor(private productService: ProductService) {}

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  uploadFile(): void {
    if (!this.selectedFile) return;

    this.isUploading = true;
    this.errorMessage = '';

    this.productService.uploadBulkFile(this.selectedFile).subscribe({
      next: (res) => {
        this.isUploading = false;
        this.startPolling(res.jobId);
      },
      error: (err) => {
        this.isUploading = false;
        this.errorMessage = err.error?.error || 'Upload failed';
      }
    });
  }

  startPolling(jobId: string): void {
    this.isPolling = true;
    
    // Poll every 1.5 seconds using RxJS interval + switchMap
    this.pollingSub = interval(1500).pipe(
      switchMap(() => this.productService.getBulkUploadStatus(jobId)),
      takeWhile(status => status.status === 'processing', true) // Include the final status in the stream
    ).subscribe({
      next: (status) => {
        this.jobStatus = status;
      },
      error: () => {
        this.isPolling = false;
        this.errorMessage = 'Failed to fetch status';
      },
      complete: () => {
        this.isPolling = false;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.pollingSub) {
      this.pollingSub.unsubscribe();
    }
  }
}
