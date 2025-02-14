import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router'; 
import { CommonModule } from '@angular/common';
import { AuthProvider } from '../context/auth-provider';

@Component({
  selector: 'app-private-route',
  standalone: true, 
  templateUrl: './private.routes.component.html',
  imports: [RouterModule, CommonModule], 
})
export class PrivateRoutes {
  public router = inject(Router);
  public authProvider = inject(AuthProvider);

  navigateToLogin() {
    this.router.navigate(['/login']);
    return null;
  }
}
