import {
  CanActivateFn,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('AuthGuard: Checking authentication...');

  // Try to initialize auth first
  try {
    await authService.initializeAuth();
  } catch (error) {
    console.error('AuthGuard: Failed to initialize auth', error);
  }

  const token = authService.getToken();
  const isAuthenticated = token !== null && token !== undefined;

  console.log('AuthGuard: Token exists:', !!token);
  console.log('AuthGuard: Is authenticated:', isAuthenticated);

  if (isAuthenticated) {
    return true;
  }

  console.log('AuthGuard: Redirecting to login');
  router.navigate(['/login'], {
    queryParams: { returnUrl: state.url }
  });
  return false;
};
