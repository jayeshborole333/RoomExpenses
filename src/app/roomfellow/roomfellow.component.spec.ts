import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomfellowComponent } from './roomfellow.component';

describe('RoomfellowComponent', () => {
  let component: RoomfellowComponent;
  let fixture: ComponentFixture<RoomfellowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomfellowComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoomfellowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
