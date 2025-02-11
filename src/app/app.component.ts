import { Component, signal, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { NgIf } from '@angular/common'; // Import NgIf
import { NavbarComponent } from './components/navbar/navbar.component';
import { AuthProvider } from './context/auth-provider';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, NgIf], // Add NgIf here
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  private router = inject(Router);
  private authProvider = inject(AuthProvider);
  showNavbar = signal(true);

  constructor() {
    // Listen to route changes and update navbar visibility
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const currentRoute = this.router.url;
        this.showNavbar.set(!(currentRoute === '/login' || currentRoute === '/signup' || currentRoute === '/'));
      }
    });
  }
}
