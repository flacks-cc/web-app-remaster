import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  constructor(private _http: HttpClient) {}


  private URL = 'http://localhost:8080/api/v1/products';

  getAllProducts(): Observable<Product[]> {
    return this._http.get<Product[]>(`${this.URL}`)
  }

  createProduct(product: Product): Observable<Product> {
    return this._http.post<Product>(`${this.URL}`, product)
  }

  updateProduct(id: number, product: Product): Observable<Product> {
    return this._http.put<Product>(`${this.URL}/${id}`, product)
  }

  deleteProduct(id: number): Observable<void> {
    return this._http.delete<void>(`${this.URL}/${id}`)
  }

}
