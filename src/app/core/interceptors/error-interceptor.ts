import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, EMPTY } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      return EMPTY;
    })
  );
};