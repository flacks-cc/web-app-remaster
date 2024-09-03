import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { ToastService } from '../services/util/toast.service';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const _router = inject(Router);
  const _toastService = inject(ToastService);
  const _authService = inject(AuthService);

  // Redirigir al login si el token no está presente
  const redirectToLogin = () => {
    setTimeout(() => {
      _authService.removeToken();
      _router.navigate(['/login']);
    }, 5000); // 5000 milisegundos = 5 segundos
  };

  // Intentar obtener el token desde localStorage o sessionStorage
  const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse): Observable<never> => {

      // Mostrar el mensaje correspondiente según el código de error
      switch (error.status) {
        case 400:
          _toastService.showToast(
            'Solicitud incorrecta',
            'Verifique su solicitud.',
            'error'
          );
          break;
        case 401:
          _toastService.showToast(
            'Acceso denegado',
            'Inicie sesión nuevamente.',
            'error'
          );
          break;
        case 403:
          _toastService.showToast(
            'Acceso prohibido',
            'No tiene permiso para realizar esta acción.',
            'error',
            [
              {
                label: 'Ir al inicio de sesión',
                onClick: () => redirectToLogin(),
              },
            ]
          );
          break;
        case 404:
          _toastService.showToast(
            'Recurso no encontrado',
            'El recurso que busca no existe.',
            'error'
          );
          break;
        case 500:
          _toastService.showToast(
            'Error interno del servidor',
            'Intente nuevamente más tarde o comuníquese con el administrador.',
            'error'
          );

          redirectToLogin();
          break;
        default:
          _toastService.showToast(
            'Error inesperado',
            'Intente nuevamente o comuníquese con el administrador.',
            'error'
          );

          redirectToLogin();
      }

      return throwError(() => error);
    })
  );
};
