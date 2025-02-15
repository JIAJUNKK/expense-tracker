import { Injectable, signal, effect } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {
  isExpenseModalOpen = signal(false);

  constructor() {
    effect(() => {
      if (this.isExpenseModalOpen()) {
        document.body.style.overflow = 'hidden';  
      } else {
        document.body.style.overflow = ''; 
      }
    });
  }

  openExpenseModal() {
    this.isExpenseModalOpen.set(true);
  }

  closeExpenseModal() {
    this.isExpenseModalOpen.set(false);
  }
}
