import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Service } from '../models/service.model';

@Injectable({
  providedIn: 'root'
})
export class ServiceService {

  constructor(private _http: HttpClient) {}

  private URL = 'http://localhost:8080/api/v1/services';

  getAllServices(): Observable<Service[]> {
    return this._http.get<Service[]>(`${this.URL}`)
  }

  createService(service: Service): Observable<Service> {
    return this._http.post<Service>(`${this.URL}`, service)
  }

  updateService(id: number, service: Service): Observable<Service> {
    return this._http.put<Service>(`${this.URL}/${id}`, service)
  }

  deleteService(id: number): Observable<Service> {
    return this._http.delete<Service>(`${this.URL}/${id}`)
  }

}
