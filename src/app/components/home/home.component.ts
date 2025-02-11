import { Component, Signal, signal } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'home',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  textTitle = signal('Set budgets & track spending');
  textDescription = signal('Payday to payday budgeting, merchant budgets, past and rolling budgets.');
  currentCardIndex = signal(0);

  private cardTexts = [
    { title: 'Track your spending smartly', description: 'Monitor where your money goes with real-time insights.' },
    { title: 'Manage your income efficiently', description: 'Plan ahead by keeping track of your earnings and expenses.' },
    { title: 'Save more, worry less', description: 'Automate savings and reach your financial goals effortlessly.' }
  ];

  onScroll(event: Event) {
    const container = event.target as HTMLElement;
    const scrollPosition = container.scrollLeft;
    const cardWidth = container.scrollWidth / 3; // 3 cards
    const index = Math.round(scrollPosition / cardWidth);

    if (index !== this.currentCardIndex()) {
      this.currentCardIndex.set(index);
      this.textTitle.set(this.cardTexts[index].title);
      this.textDescription.set(this.cardTexts[index].description);
    }
  }
}
