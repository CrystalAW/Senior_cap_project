import { TestBed } from '@angular/core/testing';
import { ScheduleComponent } from './schedule.component';
describe('ScheduleComponent', () => {
    let component;
    let fixture;
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ScheduleComponent]
        })
            .compileComponents();
        fixture = TestBed.createComponent(ScheduleComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });
    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
