import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Service } from '../models/service.model';

@Injectable({
  providedIn: 'root'
})
export class ServiceService {

  private URL = 'http://localhost:8080/api/v1/services';

  constructor(private httpClient: HttpClient) {}

  getAllServices(): Observable<Service[]> {
    return this.httpClient.get<Service[]>(`${this.URL}`)
  }

  createService(service: FormData): Observable<any> {
    return this.httpClient.post(`${this.URL}`, service)
  }

  updateService(id: number, service: FormData): Observable<any> {
    return this.httpClient.put(`${this.URL}/${id}`, service)
  }

  deleteService(id: number): Observable<Service> {
    return this.httpClient.delete<Service>(`${this.URL}/${id}`)
  }
}
