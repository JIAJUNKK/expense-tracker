import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthProvider } from '../../context/auth-provider';
import { GlobalService } from '../../services/shared/global.service';

@Component({
  selector: 'navbar',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  private authProvider = inject(AuthProvider);
  private modalService = inject(GlobalService);
  private router = inject(Router);

  navigateToDashboard() {
    console.log('Navigating to dashboard');
  }
  
  toggleAddExpenseModal() {
    this.modalService.openExpenseModal();
  }

  async logout() {
    await this.authProvider.logout();
    this.router.navigate(['/login']);
  }

}
