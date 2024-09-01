import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable, tap } from "rxjs";
import { UserLogin } from "./models/user/user-login.model";
import { JwtDto } from "./models/auth/jwt-dto.model";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private URL = 'http://localhost:8080/api/v1/users';
  private _http = inject(HttpClient);

  // Método de inicio de sesión
  login(userLogin: UserLogin, rememberMe: boolean = false): Observable<JwtDto> {
    return this._http.post<JwtDto>(`${this.URL}/login`, userLogin).pipe(
      tap(jwt => this.setToken(jwt.token, rememberMe))
    );
  }

  // Método para restablecer contraseña
  resetPassword(email: string, newPassword: string): Observable<any> {
    const params = new HttpParams()
      .set('email', email)
      .set('newPassword', newPassword);
    return this._http.post(`${this.URL}/password/reset/${email}`, {}, { params });
  }

  // Métodos de verificación de código
  verifyInfoCode(code: string): Observable<any> {
    return this._http.get(`${this.URL}/verification/info-code`, { params: new HttpParams().set('code', code) });
  }

  verifyPasswordCode(code: string): Observable<any> {
    return this._http.get(`${this.URL}/verification/password-code`, { params: new HttpParams().set('code', code) });
  }

  // Método para enviar código de verificación
  sendVerificationCode(email: string): Observable<any> {
    return this._http.post(`${this.URL}/verification/send-code`, {}, { params: new HttpParams().set('email', email) });
  }

  // Método para verificar si el usuario está autenticado
  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken') || !!sessionStorage.getItem('authToken');
  }

  // Método para cerrar sesión
  logout(): void {
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
  }

  // Método para guardar el token en el almacenamiento local o de sesión
  private setToken(token: string, rememberMe: boolean): void {
    if (rememberMe) {
      localStorage.setItem('authToken', token);
    } else {
      sessionStorage.setItem('authToken', token);
    }
  }
}
