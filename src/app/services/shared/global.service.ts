import { Injectable, signal, effect, inject } from '@angular/core';
import { UserService } from '../firebase/Firestore/user.service';
import { AuthProvider } from '../../context/auth-provider';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {
  isExpenseModalOpen = signal(false);
  userCurrency = 
  signal
  <
  { abbreviation: string, symbol: string }
  >({ abbreviation: 'USD', symbol: '$' });

  private userService = inject(UserService);
  private authProvider = inject(AuthProvider);

  constructor() {
    effect(() => {
      if (this.isExpenseModalOpen()) {
        document.body.style.overflow = 'hidden';  
      } else {
        document.body.style.overflow = ''; 
      }
    });

    effect(() => {
      const userId = this.authProvider.user()?.uid;
      if (userId) {
        this.fetchUserCurrency(userId);
      }
    });
  }

  openExpenseModal() {
    this.isExpenseModalOpen.set(true);
  }

  closeExpenseModal() {
    this.isExpenseModalOpen.set(false);
  }

  async fetchUserCurrency(userId: string) {
    if (!userId) return;
    const userCurrency = await this.userService.getUserCurrency(userId);
    this.userCurrency.set(userCurrency);
  }
}
