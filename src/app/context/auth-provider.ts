import { Injectable, signal } from '@angular/core';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, User } from '@angular/fire/auth';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthProvider {
  user = signal<User | null>(null); // Global state for the user

  constructor(private auth: Auth, private router: Router) {
    // Listen for auth state changes
    this.auth.onAuthStateChanged((user) => {
      this.user.set(user);
    });
  }

  async login(email: string, password: string): Promise<void> {
    try {
      await signInWithEmailAndPassword(this.auth, email, password);
      this.router.navigate(['/dashboard']);
    } catch (error) {
      console.error('Login failed', error);
    }
  }

  async signup(username: string, email: string, password: string): Promise<void> {
    try {
      // create a method to store username to firestore. 
      await createUserWithEmailAndPassword(this.auth, email, password);
      this.router.navigate(['/dashboard']);
    } catch (error) {
      console.error('Signup failed', error);
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Logout failed', error);
    }
  }
}
