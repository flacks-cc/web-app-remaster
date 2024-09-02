import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { ToastService } from '../services/util/toast.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const _router = inject(Router);
  const _toastService = inject(ToastService);

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
      console.error('Error detectado por el interceptor:', error);

      switch (error.status) {
        case 400:
          _toastService.showToast(
            'Solicitud incorrecta',
            'Verifique su solicitud.'
          );
          break;
        case 401:
          // Remover el token tanto de localStorage como de sessionStorage
          localStorage.removeItem('authToken');
          sessionStorage.removeItem('authToken');
          _toastService.showToast(
            'Acceso denegado',
            'Inicie sesión nuevamente.',
            [
              {
                label: 'Ir al inicio de sesión',
                onClick: () => _router.navigate(['/auth/login']),
              },
            ]
          );
          break;
        case 403:
          _toastService.showToast(
            'Acceso prohibido',
            'No tiene permiso para realizar esta acción.'
          );
          break;
        case 404:
          _toastService.showToast(
            'Recurso no encontrado',
            'El recurso que busca no existe.'
          );
          break;
        case 500:
          _toastService.showToast(
            'Error interno del servidor',
            'Intente nuevamente más tarde o comuníquese con el administrador.'
          );
          break;
        default:
          _toastService.showToast(
            'Error inesperado',
            'Intente nuevamente o comuníquese con el administrador.'
          );
          break;
      }

      return throwError(() => error);
    })
  );
};
