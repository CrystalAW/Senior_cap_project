import { TestBed } from '@angular/core/testing';
import { TasklistComponent } from './tasklist.component';
describe('TasklistComponent', () => {
    let component;
    let fixture;
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [TasklistComponent]
        })
            .compileComponents();
        fixture = TestBed.createComponent(TasklistComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });
    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
