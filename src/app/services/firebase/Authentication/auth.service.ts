import { Injectable, signal } from '@angular/core';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, User } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { UserService } from '../Firestore/user.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  user = signal<User | null>(null);

  constructor(private auth: Auth, private router: Router, private userService: UserService) {
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

  async signup(username: string, email: string, password: string): Promise<User | null> {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;
      
      const storedUser = await this.userService.storeUser(user.uid, { username });
      if (storedUser){
        this.router.navigate(['/dashboard']);
      }
      return user;
    } catch (error) {
      console.error('Signup failed', error);
      return null;
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
