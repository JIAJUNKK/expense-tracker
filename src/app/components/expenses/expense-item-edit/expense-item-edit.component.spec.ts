import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseItemEditComponent } from './expense-item-edit.component';

describe('ExpenseItemEditComponent', () => {
  let component: ExpenseItemEditComponent;
  let fixture: ComponentFixture<ExpenseItemEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpenseItemEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpenseItemEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
