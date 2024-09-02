import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../auth.service';

export const authGuard: CanActivateFn = () => {
  const _authService = inject(AuthService);
  const router = inject(Router);

  if (_authService.isAuthenticated()) {
    return true;
  } else {
    console.warn('Acceso denegado. El usuario no está autenticado');
    router.navigate(['/login']); // Redirige a la página de login si no está autenticado
    return false;
  }
};
