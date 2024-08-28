// import { Injectable, inject } from '@angular/core';
// import { HttpClient, HttpParams } from '@angular/common/http';
// import { Observable, tap } from 'rxjs';
// import { UserLogin } from './models/user/user-login.model';
// import { NewUser } from './models/user/new-user.model';
// import { JwtDto } from './models/auth/jwt-dto.model';

// @Injectable({
//   providedIn: 'root'
// })
// export class AuthService {

//   private baseUrl = 'http://localhost:8080/api/v1/auth';
//   private _http = inject(HttpClient);

//   register(newUser: NewUser): Observable<any> {
//     return this._http.post<any>(`${this.baseUrl}/register`, newUser);
//   }

//   login(userLogin: UserLogin, rememberMe: boolean = false): Observable<JwtDto> {
//     return this._http.post<JwtDto>(`${this.baseUrl}/login`, userLogin).pipe(
//       tap(jwt => {
//         this.setToken(jwt.token, rememberMe);
//       })
//     );
//   }

//   resetPassword(email: string, newPassword: string): Observable<any> {
//     const params = new HttpParams()
//       .set('email', email)
//       .set('newPassword', newPassword);

//     return this._http.post(`${this.baseUrl}/password/reset/${email}`, {}, { params });
//   }

//   verifyInfoCode(code: string): Observable<any> {
//     const params = new HttpParams().set('code', code);
//     return this._http.get(`${this.baseUrl}/verification/info-code`, { params });
//   }

//   verifyPasswordCode(code: string): Observable<any> {
//     const params = new HttpParams().set('code', code);
//     return this._http.get(`${this.baseUrl}/verification/password-code`, { params });
//   }

//   sendVerificationCode(email: string): Observable<any> {
//     const params = new HttpParams().set('email', email);
//     return this._http.post(`${this.baseUrl}/verification/send-code`, {}, { params });
//   }

//   // Método para verificar si el usuario está autenticado
//   isAuthenticated(): boolean {
//     const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
//     return !!token;
//   }

//   // Método para cerrar sesión
//   logout(): Observable<void> {
//     localStorage.removeItem('authToken');
//     sessionStorage.removeItem('authToken');
//     return new Observable<void>(observer => {
//       observer.next();
//       observer.complete();
//     });
//   }

//   // Método para guardar el token en el almacenamiento local o de sesión
//   private setToken(token: string, rememberMe: boolean): void {
//     if (rememberMe) {
//       console.log('Guardando token en el almacenamiento local');
//       localStorage.setItem('authToken', token);
//     } else {
//       console.log('Guardando token en el almacenamiento de sesión');
//       sessionStorage.setItem('authToken', token);
//     }
//   }
// }
