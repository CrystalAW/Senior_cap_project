import { TestBed } from '@angular/core/testing';
import { GoogleCalendarService } from '../google-calendar.service';
describe('GoogleCalendarService', () => {
    let service;
    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(GoogleCalendarService);
    });
    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
