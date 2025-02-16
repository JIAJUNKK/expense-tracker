import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CurrencyService } from '../../services/currency.service';
import { UserService } from '../../services/firebase/Firestore/user.service';
import { AuthProvider } from '../../context/auth-provider';
import { Currency } from '../../utils/app.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  private userService = inject(UserService);
  private currencyService = inject(CurrencyService);
  private authProvider = inject(AuthProvider);
  
  userId: string | null = null;
  userInfo: { email: string; name: string } | null = null;
  selectedCurrency: Currency | null = null;
  categories: string[] = [];
  newCategory: string = ''; 
  currenciesList: Currency[] = [];

  async fetchProfileData() {
    this.userId = this.authProvider.user()?.uid ?? null;
    if (!this.userId) return;

    this.userInfo = await this.userService.getUserInfo(this.userId);
    this.categories = await this.userService.getUserCategories(this.userId);

    this.currenciesList = this.currencyService.getCurrencies();
    const userCurrency = await this.userService.getUserCurrency(this.userId);

    this.selectedCurrency = this.currenciesList.find(
      cur => cur.abbreviation === userCurrency.abbreviation
    ) ?? this.currenciesList[0];
  }

  async updateCurrency(event: Event) {
    if (!this.userId) return;

    const selectedAbbreviation = (event.target as HTMLSelectElement).value;

    // Find the full currency object
    const newCurrency = this.currenciesList.find(
      cur => cur.abbreviation === selectedAbbreviation
    );

    if (!newCurrency) return;

    this.selectedCurrency = newCurrency; // Keep full object reference
    await this.userService.updateUserCurrency(this.userId, newCurrency.abbreviation, newCurrency.symbol);
  }

  async addCategory(newCategory: string) {
    if (!this.userId) return;
    await this.userService.addUserCategory(this.userId, newCategory);
    this.categories.push(newCategory);
  }

  get selectedCurrencyAbbreviation(): string {
    return this.selectedCurrency ? this.selectedCurrency.abbreviation : '';
  }
  
  set selectedCurrencyAbbreviation(abbreviation: string) {
    const newCurrency = this.currenciesList.find(cur => cur.abbreviation === abbreviation);
    if (newCurrency) {
      this.selectedCurrency = newCurrency;
    }
  }

  ngOnInit() {
    this.fetchProfileData();
  }
}
