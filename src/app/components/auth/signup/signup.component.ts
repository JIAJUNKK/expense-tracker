import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthProvider } from '../../../context/auth-provider';

@Component({
  selector: 'signup',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent {
  username = '';
  email = '';
  password = '';
  confirmPassword = '';
  passwordVisible = false;
  confirmPasswordVisible = false;

  constructor(private authProvider: AuthProvider, private router: Router) {}

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }

  toggleConfirmPasswordVisibility() {
    this.confirmPasswordVisible = !this.confirmPasswordVisible;
  }

  goBack() {
    this.router.navigate(['/']);
  }

  async signup() {
    if (!this.username || !this.email || !this.password || !this.confirmPassword) {
      console.error('All fields are required');
      return;
    }
    await this.authProvider.signup(this.username, this.email, this.password);
  }
}
