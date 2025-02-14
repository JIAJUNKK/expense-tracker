import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router'; 
import { CommonModule } from '@angular/common';
import { AuthProvider } from '../../context/auth-provider';

@Component({
  selector: 'app-private-route',
  standalone: true, 
  imports: [RouterModule, CommonModule], 
  template: `
    <ng-container *ngIf="!authProvider.isSettingUser(); else loading">
      <ng-container *ngIf="authProvider.user(); else redirectToLogin">
        <router-outlet></router-outlet> 
      </ng-container>
    </ng-container>
    <ng-template #loading>
      <p>Loading...</p> <!-- Show loading instead of redirecting too early -->
    </ng-template>
    <ng-template #redirectToLogin>
      {{ navigateToLogin() }}
    </ng-template>
  `,
})
export class PrivateRouteComponent {
  public router = inject(Router);
  public authProvider = inject(AuthProvider);

  navigateToLogin() {
    this.router.navigate(['/login']);
    return null;
  }
}
