import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Product {
  id: number;
  uniqueId: string;
  name: string;
  price: string;
  stock: number;
  image?: string;
  categoryId: number;
  category?: { id: number; uniqueId: string; name: string };
  createdAt: string;
}

export interface ProductResponse {
  data: Product;
}

export interface ProductsResponse {
  data: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) {}

  getProducts(
    page: number = 1, limit: number = 20, sort: string = 'createdAt', order: string = 'desc', search: string = '',
    filters?: { priceMin?: number, priceMax?: number, stockMin?: number, dateStart?: string, dateEnd?: string, categoryId?: number }
  ): Observable<ProductsResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString())
      .set('sort', sort)
      .set('order', order);
      
    if (search) params = params.set('search', search);
    if (filters?.priceMin != null) params = params.set('priceMin', filters.priceMin.toString());
    if (filters?.priceMax != null) params = params.set('priceMax', filters.priceMax.toString());
    if (filters?.stockMin != null) params = params.set('stockMin', filters.stockMin.toString());
    if (filters?.dateStart) params = params.set('dateStart', filters.dateStart);
    if (filters?.dateEnd) params = params.set('dateEnd', filters.dateEnd);
    if (filters?.categoryId) params = params.set('categoryId', filters.categoryId.toString());

    return this.http.get<ProductsResponse>(this.apiUrl, { params });
  }

  getProductById(id: number): Observable<ProductResponse> {
    return this.http.get<ProductResponse>(`${this.apiUrl}/${id}`);
  }

  createProduct(formData: FormData): Observable<ProductResponse> {
    return this.http.post<ProductResponse>(this.apiUrl, formData);
  }

  updateProduct(id: number, formData: FormData): Observable<ProductResponse> {
    return this.http.put<ProductResponse>(`${this.apiUrl}/${id}`, formData);
  }

  deleteProduct(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }

  uploadBulkFile(file: File): Observable<{ message: string; jobId: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ message: string; jobId: string }>(`${this.apiUrl}/bulk-upload`, formData);
  }

  getBulkUploadStatus(jobId: string): Observable<{ status: string; processedCount: number; totalCount: number; errors: any[] }> {
    return this.http.get<any>(`${this.apiUrl}/bulk-upload/status/${jobId}`);
  }

  downloadReport(format: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/report?format=${format}`, { responseType: 'blob' });
  }
}
