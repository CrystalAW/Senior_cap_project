import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalWeekComponent } from './cal-week.component';

describe('CalWeekComponent', () => {
  let component: CalWeekComponent;
  let fixture: ComponentFixture<CalWeekComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CalWeekComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalWeekComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
