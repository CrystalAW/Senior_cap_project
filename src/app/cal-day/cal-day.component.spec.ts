import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalDayComponent } from './cal-day.component';

describe('CalDayComponent', () => {
  let component: CalDayComponent;
  let fixture: ComponentFixture<CalDayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CalDayComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalDayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
