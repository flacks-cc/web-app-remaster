import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, tap, timer } from 'rxjs';
import { UserAuthentication } from '../models/user_authentication.model';
import { AuthenticationResponse } from '../models/authentication-response.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly URL = `${environment.apiUrl}/users`;
  private _http = inject(HttpClient);
  private tokenExpirationTimer: any;

  // Método de inicio de sesión
  login(
    userLogin: UserAuthentication,
    rememberMe: boolean = false
  ): Observable<AuthenticationResponse> {
    return this._http.post<any>(`${this.URL}/login`, userLogin).pipe(
      tap((response) => {
        const token = response.access_token;
        if (token) {
          this.setToken(token, rememberMe);
          this.startExpirationTimer(token);
        }
      })
    );
  }

  // Método para verificar si el usuario está autenticado y el token no ha expirado
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    return !this.isTokenExpired(token);
  }

  // Método para cerrar sesión
  logout(): Observable<void> {
    this.removeToken();
    this.clearExpirationTimer();
    return new Observable<void>((observer) => {
      observer.next();
      observer.complete();
    });
  }

  // Método para obtener el token actual
  private getToken(): string | null {
    return (
      localStorage.getItem('authToken') || sessionStorage.getItem('authToken')
    );
  }

  // Método para guardar el token en el almacenamiento local o de sesión
  private setToken(token: string, rememberMe: boolean): void {
    if (rememberMe) {
      localStorage.setItem('authToken', token);
    } else {
      sessionStorage.setItem('authToken', token);
    }
  }

  // Método para eliminar el token del almacenamiento
  removeToken(): void {
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
  }

  // Método para decodificar el token JWT
  private decodeToken(token: string): any {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (error) {
      console.error('Error decodificando el token:', error);
      return null;
    }
  }

  // Método para verificar si el token ha expirado
  private isTokenExpired(token: string): boolean {
    const decodedToken = this.decodeToken(token);
    if (!decodedToken) return true;

    const expirationDate = new Date(decodedToken.exp * 1000);
    return expirationDate <= new Date();
  }

  // Método para iniciar el timer de expiración
  private startExpirationTimer(token: string): void {
    this.clearExpirationTimer();

    const decodedToken = this.decodeToken(token);
    if (!decodedToken) return;

    const expirationDate = new Date(decodedToken.exp * 1000);
    const timeUntilExpiration = expirationDate.getTime() - new Date().getTime();

    if (timeUntilExpiration > 0) {
      this.tokenExpirationTimer = setTimeout(() => {
        console.log('Token expirado - Cerrando sesión automáticamente');
        this.logout().subscribe();
      }, timeUntilExpiration);
    }
  }

  // Método para limpiar el timer de expiración
  private clearExpirationTimer(): void {
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
      this.tokenExpirationTimer = null;
    }
  }
}
