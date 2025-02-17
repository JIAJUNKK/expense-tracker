import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseFilterBarComponent } from './expense-filter-bar.component';

describe('ExpenseFilterBarComponent', () => {
  let component: ExpenseFilterBarComponent;
  let fixture: ComponentFixture<ExpenseFilterBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpenseFilterBarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpenseFilterBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
