import { TestBed } from '@angular/core/testing';
import { ScheduleService } from './schedule.service';
describe('ScheduleService', () => {
    let service;
    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ScheduleService);
    });
    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
