import { Injectable, inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthProvider } from './auth-provider';

export const AuthGuard: CanActivateFn = (route, state) => {
  const authProvider = inject(AuthProvider);
  const router = inject(Router);

  if (authProvider.user()) {
    return true; // Allow access if user is logged in
  } else {
    router.navigate(['/login']);
    return false; // Block access and redirect to login
  }
};
