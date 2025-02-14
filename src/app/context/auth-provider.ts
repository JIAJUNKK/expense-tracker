import { Injectable, signal, effect, inject } from '@angular/core';
import { AuthService } from '../services/firebase/Authentication/auth.service';
import { User } from '@angular/fire/auth';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthProvider {
  user = signal<User | null>(null); // Global state for the user
  isSettingUser = signal(true); // ✅ Prevents unnecessary redirects before session check is done

  constructor(private authService: AuthService, private router: Router) {
    // Restore the user session when the app loads
    this.authService.onAuthStateChanged((authUser) => {
      if (authUser) {
        console.log("authUser: ", authUser);
        this.user.set(authUser);
      } else {
        console.log("No user");
        this.user.set(null);
      }
      this.isSettingUser.set(false);
    });

    // 🔥 Check if user is already logged in
    const currentUser = this.authService.user();
    if (currentUser) {
      this.user.set(currentUser);
      this.isSettingUser.set(false);
    }
  }

  async login(email: string, password: string): Promise<void> {
    try {
      const user = await this.authService.login(email, password);
      if (user){
        this.user.set(user);
        this.router.navigate(['/dashboard']);
      }
    } catch (error) {
      console.error('Login failed', error);
    }
  }

  async signup(username: string, email: string, password: string): Promise<void> {
    try {
      const user = await this.authService.signup(username, email, password);
      if (user){
        this.user.set(user);
        this.router.navigate(['/dashboard']);
      }
    } catch (error) {
      console.error('Signup failed', error);
    }
  }

  async handleGoogleSignIn(): Promise<void> {
    try {
      const user = await this.authService.googleSignIn();
      if (user) {
        this.user.set(user);
        this.router.navigate(['/dashboard']);
      }
    } catch (error) {
      console.error('Google Sign-In failed', error);
    }
  }

  async logout(): Promise<void> {
    try {
      await this.authService.logout();
      this.user.set(null); 
    } catch (error) {
      console.error('Logout failed', error);
    }
  }
}
