import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

/**
 * if user is not logged in, redirect to login page
 * @returns 
 */
export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  } else {
    return router.parseUrl('/login');
  }
};
