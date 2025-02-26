import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrencyService } from '../../services/currency.service';

@Component({
  selector: 'app-currency-dropdown',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './currency-dropdown.component.html',
  styleUrls: ['./currency-dropdown.component.scss'],
})
export class CurrencyDropdownComponent {
  private currencyService = new CurrencyService();

  @Input() isOpen: boolean = false;
  @Output() currencySelected = new EventEmitter<{ symbol: string; abbreviation: string }>();
  @Output() dropdownToggled = new EventEmitter<boolean>();

  currenciesList = this.currencyService.getCurrencies();

  selectCurrency(symbol: string, abbreviation: string) {
    this.currencySelected.emit({ symbol, abbreviation });
    this.dropdownToggled.emit(false); // Close dropdown after selection
  }

  closeDropdown() {
    this.dropdownToggled.emit(false);
  }
}
