import { Injectable, signal, effect } from '@angular/core';
import { AuthService } from '../services/firebase/Authentication/auth.service';
import { UserService } from '../services/firebase/Firestore/user.service';
import { User } from '@angular/fire/auth';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthProvider {
  user = signal<User | null>(null); // Global state for the user

  constructor(private authService: AuthService, private userService: UserService, private router: Router) {
    // Automatically track user state changes using effect()
    effect(() => {
      const authUser = this.authService.user(); // Read signal value
      if (authUser) {
        this.user.set(authUser);
      } else {
        this.user.set(null);
        this.router.navigate(['/']); // Redirect to home if not logged in
      }
    });
  }

  async login(email: string, password: string): Promise<void> {
    try {
      await this.authService.login(email, password);
    } catch (error) {
      console.error('Login failed', error);
    }
  }

  async signup(username: string, email: string, password: string): Promise<void> {
    try {
      await this.authService.signup(username, email, password);
    } catch (error) {
      console.error('Signup failed', error);
    }
  }

  async logout(): Promise<void> {
    try {
      await this.authService.logout();
    } catch (error) {
      console.error('Logout failed', error);
    }
  }
}
