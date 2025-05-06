import { ChangeDetectionStrategy, Component, TemplateRef, ViewChild, } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { CalendarEvent, CalendarEventTimesChangedEvent, CalendarView } from 'angular-calendar';
import { EventColor, ViewPeriod } from 'calendar-utils';
import { isSameDay, isSameMonth } from 'date-fns';
import moment from 'moment-timezone';
import { Subject } from 'rxjs';
import { GoogleCalendarService } from '../services/google-calendar.service';

const colors: Record<string, EventColor> = {
  red: {
    primary: '#ad2121',
    secondary: '#FAE3E3',
  },
  blue: {
    primary: '#1e90ff',
    secondary: '#D1E8FF',
  },
  yellow: {
    primary: '#e3bc08',
    secondary: '#FDF1BA',
  },
};


moment.tz.setDefault('Utc');

@Component({
  selector: 'app-calendar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent {
  @ViewChild('modalContent', { static: true }) modalContent: TemplateRef<any> | undefined;

  view: CalendarView = CalendarView.Month;

  CalendarView = CalendarView;

  viewDate: Date =  moment().toDate();

  activeModalRef: NgbModalRef | null = null

  modalData: {
    action: string;
    event: CalendarEvent;
  } | undefined;

  refresh = new Subject<void>();
  clickedDate: Date | null = null;
  showAddEventBox = false;
  showEventDetails = false;
  newEventTitle = '';
  startEventdate = '';
  endEventdate = '';
  events: CalendarEvent[] = [];
  activeDayIsOpen: boolean = true;
  viewPeriod: ViewPeriod | undefined;


  constructor(private modal: NgbModal, private calService: GoogleCalendarService) {}

  ngOnInit() {
    // pulls the events from google calendar
    this.reload();
  }

  reload() {
     // pulls the events from google calendar
     this.calService.getEvents().subscribe((googleEvents) => {
      const mapped = googleEvents.map(this.mapGoogleToCalendarEvent);
      this.events = [...this.events, ...mapped];
      this.refresh.next(); 
    });
  }
  
  /**
   * from angular-cal pckge
   * @param param0 
   */
  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (isSameMonth(date, this.viewDate)) {
      if (
        (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
        events.length === 0
      ) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
      }
      this.viewDate = date;
    }
    this.clickedDate = date;
    this.showAddEventBox = true;
    this.newEventTitle = '';
  }

  /**
   * from angular-cal pckge
   * @param param0 
   */
  eventTimesChanged({
    event,
    newStart,
    newEnd,
  }: CalendarEventTimesChangedEvent): void {
    this.events = this.events.map((iEvent) => {
      if (iEvent === event) {
        return {
          ...event,
          start: newStart,
          end: newEnd,
        };
      }
      return iEvent;
    });
    this.handleEvent('Dropped or resized', event);
  }

  /**
   *maps google-cal event info to match template on angular-cal pckge
   * @param googleEvent 
   * @returns 
   */
   mapGoogleToCalendarEvent(googleEvent: any): CalendarEvent {
    const isAllDay = !!googleEvent.start.date;
    const start = googleEvent.start.dateTime || googleEvent.start.date;
    const end = googleEvent.end?.dateTime || googleEvent.end?.date || start;
    return {
      title: googleEvent.summary || 'No title',
      start: moment(start).toDate(),
      end: moment(end).toDate(),
      allDay: isAllDay,
      color: { primary: '#1e90ff', secondary: '#D1E8FF' },
      draggable: false,
      resizable: {
        beforeStart: false,
        afterEnd: false,
      },
      meta: {
        start: googleEvent.start,
        end: googleEvent.end,
        googleId: googleEvent.id,
        original: googleEvent,
        description: googleEvent.description,
        attendees: googleEvent.attendees ?? []
      },
    };
  }

  /**
   * retrieve attendees field from google-event information array
   * @param event 
   * @returns 
   */
  getAttendees(event?: CalendarEvent): string {
    const attendees = event?.meta?.attendees;
    if (!attendees || attendees.length === 0) {
      return 'No attendees';
    }
    return attendees.map((a: { email: any; }) => a.email).join(', ');
  }

   /**
   * from angular-cal pckge
   * @param param0 
   */
  handleEvent(action: string, event: CalendarEvent): void {
    this.modalData = { event, action };
   this.activeModalRef = this.modal.open(this.modalContent, { size: 'lg' });
  }

   /**
   * from angular-cal pckge
   * @param param0 
   */
  addEvent(): void {
    if (this.clickedDate && this.newEventTitle.trim()) {
      const [startHour, startMin] = (this.startEventdate || '00:00').split(':').map(Number);
      const [endHour, endMin] = (this.endEventdate || '23:59').split(':').map(Number);
      const startTime = new Date(this.clickedDate);
      startTime.setHours(startHour, startMin, 0, 0);
      const endTime = new Date(this.clickedDate);
      endTime.setHours(endHour, endMin);

      const newEvent = {
        title: this.newEventTitle,
        start: startTime,
        end: endTime,
        color: colors['red'],
        draggable: true,
        resizable: {
          beforeStart: true,
          afterEnd: true,
        },
      };
      this.events = [...this.events, newEvent];
      this.showAddEventBox = false;
      this.calService.addEvent(newEvent).subscribe({
        next: (response) => {
          console.log('Event created:', response);
          const newCalevent = this.mapGoogleToCalendarEvent(response);
          this.events = [...this.events, newCalevent];
        },
        error: (err) => {
          console.error('Error adding event:', err); 
        },
      });
    }
  }

  /**
   * deletes from both website and google calendar
   */
  deleteEvent(deletedEvent: CalendarEvent) {
    this.events = this.events.filter((event) => event !== deletedEvent);
    const delEventid = deletedEvent.meta?.googleId;
    if (delEventid) {
      this.calService.deleteEvent(delEventid).subscribe({
        next: (response) => {
          console.log('Event deleted:', response);
            this.activeModalRef!.close();
        },
        error: (err) => {
          console.error('Error deleting event:', err);
        },
      });
    } else {
      console.error('No google Id found!')
    }
  }
  
  
  //from angular-cal pckge
  setView(view: CalendarView) {
    this.view = view;
  }

  //from angular-cal pckge
  closeOpenMonthViewDay() {
    this.activeDayIsOpen = false;
  }
}
