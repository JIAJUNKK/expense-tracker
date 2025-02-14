import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthProvider } from '../../../context/auth-provider';

@Component({
  selector: 'login',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  email = '';
  password = '';
  passwordVisible = false;

  constructor(private authProvider: AuthProvider, private router: Router) {}

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }

  async login() {
    if (!this.email || !this.password) {
      console.error('Email and password are required');
      return;
    }
    await this.authProvider.login(this.email, this.password);
  }

  async googleSignIn() {
    try {
      await this.authProvider.handleGoogleSignIn();
    } catch (error) {
      console.error('Google Sign-In failed', error);
    }
  }

  goBack() {
    this.router.navigate(['/']);
  }
}
