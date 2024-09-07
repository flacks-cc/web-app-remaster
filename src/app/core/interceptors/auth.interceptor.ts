import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, tap } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { ToastService } from '../services/util/toast.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // console.log('Interceptor iniciado');
  
  const _router = inject(Router);
  const _toastService = inject(ToastService);

  // Intentar obtener el token desde localStorage o sessionStorage
  const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  // console.log('Token obtenido:', token ? 'Presente' : 'Ausente');

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    // console.log('Request clonada con token de autorización');
  } else {
    // console.log('Request sin token de autorización');
  }

  // console.log('Request saliente:', {
  //   url: req.url,
  //   method: req.method,
  //   headers: req.headers.keys().map(key => `${key}: ${req.headers.get(key)}`),
  //   body: req.body
  // });

  return next(req).pipe(
    tap(
      event => {
        // console.log('Respuesta exitosa:', event)
      },
      error => {
        // console.error('Error en la respuesta:', error)
      }
    ),
    catchError((error: HttpErrorResponse): Observable<never> => {
      // console.error('Error detectado por el interceptor:', error);
      // console.log('Tipo de error:', error.name);
      // console.log('Mensaje de error:', error.message);
      // console.log('Estado del error:', error.status);
      // console.log('URL de la solicitud:', error.url);

      switch (error.status) {
        case 400:
          // console.log('Manejando error 400: Solicitud incorrecta');
          _toastService.showToast(
            'Solicitud incorrecta',
            'Verifique su solicitud.',
            'error',
            [
              {
                label: 'Ir al inicio de sesión',
                onClick: () => {
                  // console.log('Redirigiendo al login después de error 400');
                  _router.navigate(['/login']);
                },
              },
            ]
          );
          break;
        case 401:
          // console.log('Manejando error 401: Acceso no autorizado');
          localStorage.removeItem('authToken');
          sessionStorage.removeItem('authToken');
          // console.log('Tokens eliminados del almacenamiento');
          _toastService.showToast(
            'Acceso denegado',
            'Inicie sesión nuevamente.',
            'error',
            [
              {
                label: 'Ir al inicio de sesión',
                onClick: () => {
                  // console.log('Redirigiendo al login después de error 401');
                  _router.navigate(['/login']);
                },
              },
            ]
          );
          break;
        case 403:
          // console.log('Manejando error 403: Acceso prohibido');
          _toastService.showToast(
            'Acceso prohibido',
            'No tiene permiso para realizar esta acción.',
            'error',
            [
              {
                label: 'Ir al inicio de sesión',
                onClick: () => {
                  // console.log('Redirigiendo al login después de error 403');
                  _router.navigate(['/login']);
                },
              },
            ]
          );
          break;
        case 404:
          // console.log('Manejando error 404: Recurso no encontrado');
          _toastService.showToast(
            'Recurso no encontrado',
            'El recurso que busca no existe.',
            'error',
            [
              {
                label: 'Ir al inicio de sesión',
                onClick: () => {
                  // console.log('Redirigiendo al login después de error 404');
                  _router.navigate(['/login']);
                },
              },
            ]
          );
          break;
        case 500:
          // console.log('Manejando error 500: Error interno del servidor');
          _toastService.showToast(
            'Error interno del servidor',
            'Intente nuevamente más tarde o comuníquese con el administrador.',
            'error',
            [
              {
                label: 'Ir al inicio de sesión',
                onClick: () => {
                  // console.log('Redirigiendo al login después de error 500');
                  _router.navigate(['/login']);
                },
              },
            ]
          );
          break;
        default:
          // console.log(`Manejando error desconocido: ${error.status}`);
          _toastService.showToast(
            'Error inesperado',
            'Intente nuevamente o comuníquese con el administrador.',
            'error',
            [
              {
                label: 'Ir al inicio de sesión',
                onClick: () => {
                  // console.log('Redirigiendo al login después de error desconocido');
                  _router.navigate(['/login']);
                },
              },
            ]
          );
          break;
      }

      // console.log('Lanzando error para ser manejado por la aplicación');
      return throwError(() => error);
    })
  );
};