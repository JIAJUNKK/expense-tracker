import { Component, signal, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common'; // Import NgIf
import { GlobalService } from './services/shared/global.service';
import { NavbarComponent } from './components/navbar/navbar.component';
import { AddExpenseModalComponent } from './components/expenses/add-expense-modal/add-expense-modal.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, 
    CommonModule,

    NavbarComponent, 
    AddExpenseModalComponent,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  private router = inject(Router);
  public globalService = inject(GlobalService);

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
