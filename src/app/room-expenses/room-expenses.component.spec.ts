import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomExpensesComponent } from './room-expenses.component';

describe('RoomExpensesComponent', () => {
  let component: RoomExpensesComponent;
  let fixture: ComponentFixture<RoomExpensesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomExpensesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoomExpensesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
