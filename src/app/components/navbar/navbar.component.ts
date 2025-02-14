import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthProvider } from '../../context/auth-provider';

@Component({
  selector: 'navbar',
  standalone: true,
  imports: [RouterModule], // Import RouterModule
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  private authProvider = inject(AuthProvider);
  private router = inject(Router);

  navigateToDashboard() {
    console.log('Navigating to dashboard');
  }
  
  async logout() {
    await this.authProvider.logout();
    this.router.navigate(['/login']);
  }

}
