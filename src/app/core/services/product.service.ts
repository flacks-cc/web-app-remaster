import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Product } from '../models/product.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly URL = `${environment.apiUrl}/products`;

  constructor(private httpClient: HttpClient) {}

  getAllProducts(): Observable<Product[]> {
    return this.httpClient.get<Product[]>(this.URL);
  }

  createProduct(product: FormData): Observable<any> {
    return this.httpClient.post(this.URL, product);
  }

  updateProduct(id: number, product: FormData): Observable<any> {
    return this.httpClient.put(`${this.URL}/${id}`, product);
  }

  deleteProduct(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.URL}/${id}`);
  }
}
