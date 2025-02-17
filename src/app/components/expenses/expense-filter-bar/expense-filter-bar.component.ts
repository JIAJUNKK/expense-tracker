import { Component, Output, EventEmitter, Signal, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-expense-filter-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './expense-filter-bar.component.html',
  styleUrls: ['./expense-filter-bar.component.scss']
})
export class ExpenseFilterBarComponent {
  @Output() filterChange = new EventEmitter<string>();

  selectedMonth = signal<string>(this.getCurrentMonth());
  selectedYear = signal<string>(this.getCurrentYear());

  months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  years = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - i).toString());

  isMonthDropdownOpen = signal<boolean>(false);
  isYearDropdownOpen = signal<boolean>(false);

  getCurrentMonth(): string {
    return new Date().toLocaleString('default', { month: 'short' });
  }

  getCurrentYear(): string {
    return new Date().getFullYear().toString();
  }

  toggleDropdown(type: 'month' | 'year') {
    if (type === 'month') {
      this.isMonthDropdownOpen.set(!this.isMonthDropdownOpen());
      this.isYearDropdownOpen.set(false); // Close year dropdown if open
    } else {
      this.isYearDropdownOpen.set(!this.isYearDropdownOpen());
      this.isMonthDropdownOpen.set(false); // Close month dropdown if open
    }
  }

  selectMonth(month: string) {
    this.selectedMonth.set(month);
    this.isMonthDropdownOpen.set(false);
    this.setFilter();
  }

  selectYear(year: string) {
    this.selectedYear.set(year);
    this.isYearDropdownOpen.set(false);
    this.setFilter();
  }

  setFilter() {
    const filterValue = `${this.selectedMonth()}_${this.selectedYear()}`;
    this.filterChange.emit(filterValue);
  }

  // Click outside logic
  @HostListener('document:click', ['$event'])
  handleClickOutside(event: Event) {
    if (!(event.target as HTMLElement).closest('.dropdown')) {
      this.isMonthDropdownOpen.set(false);
      this.isYearDropdownOpen.set(false);
    }
  }
}
