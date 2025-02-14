import { Injectable, signal } from '@angular/core';
import { 
    Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, User, 
    GoogleAuthProvider, signInWithPopup, onAuthStateChanged, getAuth
} from '@angular/fire/auth';
import { Router } from '@angular/router';
import { UserService } from '../Firestore/user.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  user = signal<User | null>(null);

  constructor(private auth: Auth, private router: Router, private userService: UserService) {
    // Listen to auth state changes
    onAuthStateChanged(this.auth, (user) => {
      this.user.set(user);
    });

    // 🔥 Ensure we check the current user if session is already active
    const currentUser = getAuth().currentUser;
    if (currentUser) {
      this.user.set(currentUser);
    }
  }

  async login(email: string, password: string): Promise<User | null> {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error('Login failed', error);
      return null;
    }
  }

  async signup(username: string, email: string, password: string): Promise<User | null> {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;
      await this.userService.storeUser(user.uid, { username, email });
      return user;
    } catch (error) {
      console.error('Signup failed', error);
      return null;
    }
  }
  
  async googleSignIn(): Promise<User | null> {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(this.auth, provider);
      const user = userCredential.user;

      await this.userService.storeUser(user.uid, { username: user.displayName || '', email: user.email || '' });

      return user;
    } catch (error) {
      console.error('Google Sign-In failed', error);
      return null;
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
      this.user.set(null);
    } catch (error) {
      console.error('Logout failed', error);
    }
  }

  onAuthStateChanged(callback: (user: User | null) => void): void {
    onAuthStateChanged(this.auth, callback);
  }
}
