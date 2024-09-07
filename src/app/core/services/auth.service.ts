import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable, tap } from "rxjs";
import { UserAuthentication } from "../models/user_authentication.model";
import { AuthenticationResponse } from "../models/authentication-response.model";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private URL = 'https://api-rest-flacks.onrender.com/api/v1/users';
  private _http = inject(HttpClient);

  // Método de inicio de sesión
  login(userLogin: UserAuthentication, rememberMe: boolean = false): Observable<AuthenticationResponse> {
    return this._http.post<any>(`${this.URL}/login`, userLogin).pipe(
      tap(response => {
        const token = response.access_token;
        if (token) {
          this.setToken(token, rememberMe);
        }
      })
    );
  }

  // Método para verificar si el usuario está autenticado
  isAuthenticated(): boolean {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    return !!token;
  }

  // Método para cerrar sesión
  logout(): Observable<void> {
    // Aquí podrías realizar alguna llamada al backend si es necesario
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
    return new Observable<void>(observer => {
      observer.next();
      observer.complete();
    });
  }

  // Método para guardar el token en el almacenamiento local o de sesión
  private setToken(token: string, rememberMe: boolean): void {
    if (rememberMe) {
      console.log('Guardando token en el almacenamiento local');
      localStorage.setItem('authToken', token);
    } else {
      console.log('Guardando token en el almacenamiento de sesión');
      sessionStorage.setItem('authToken', token);
    }
  }
}
