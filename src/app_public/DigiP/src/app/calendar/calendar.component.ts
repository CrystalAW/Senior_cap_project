import { ChangeDetectionStrategy, Component, TemplateRef, ViewChild, } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CalendarEvent, CalendarEventAction, CalendarEventTimesChangedEvent, CalendarMonthViewBeforeRenderEvent, CalendarView } from 'angular-calendar';
import { EventColor, ViewPeriod } from 'calendar-utils';
import { endOfDay, isSameDay, isSameMonth, startOfDay } from 'date-fns';
import moment from 'moment-timezone';
import { RRule } from 'rrule';
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

interface RecurringEvent {
  title: string;
  color: any;
  rrule?: {
    freq: any;
    bymonth?: number;
    bymonthday?: number;
    byweekday?: any;
  };
}

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

  modalData: {
    action: string;
    event: CalendarEvent;
  } | undefined;

  actions: CalendarEventAction[] = [
    // {
    //   label: '<i class="fas fa-fw fa-pencil-alt"></i>',
    //   a11yLabel: 'Edit',
    //   onClick: ({ event }: { event: CalendarEvent }): void => {
    //     this.handleEvent('Edited', event);
    //   },
    // },
    // {
    //   label: '<i class="fas fa-fw fa-trash-alt"></i>',
    //   a11yLabel: 'Delete',
    //   onClick: ({ event }: { event: CalendarEvent }): void => {
    //     this.events = this.events.filter((iEvent) => iEvent !== event);
    //     this.handleEvent('Deleted', event);
    //   },
    // },
  ];

  refresh = new Subject<void>();
  clickedDate: Date | null = null;
  showAddEventBox = false;
  showEventDetails = false;
  newEventTitle = '';
  events: CalendarEvent[] = [];

  activeDayIsOpen: boolean = true;


  viewPeriod: ViewPeriod | undefined;

recurringEvents: RecurringEvent[] = [];


  constructor(private modal: NgbModal, private calService: GoogleCalendarService) {}

  ngOnInit() {
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
    this.modal.open(this.modalContent, { size: 'lg' });
  }

   /**
   * from angular-cal pckge
   * @param param0 
   */
  addEvent(): void {
    if (this.clickedDate && this.newEventTitle.trim()) {
      this.events = [
        ...this.events,
        {
          title: this.newEventTitle,
          start: startOfDay(this.clickedDate),
          end: endOfDay(this.clickedDate),
          color: colors['red'],
          draggable: true,
          resizable: {
            beforeStart: true,
            afterEnd: true,
          },
        },
      ];
      this.showAddEventBox = false;
    }
  }

  deleteEvent(eventToDelete: CalendarEvent) {
    this.events = this.events.filter((event) => event !== eventToDelete);
  }
 /**
   * from angular-cal pckge
   * @param param0 
   */
  updateCalendarEvents(viewRender: CalendarMonthViewBeforeRenderEvent): void {
    if (
      !this.viewPeriod ||
      !moment(this.viewPeriod.start).isSame(viewRender.period.start) ||
      !moment(this.viewPeriod.end).isSame(viewRender.period.end)
    ) {
      this.viewPeriod = viewRender.period;
  
      const newRecurringEvents: CalendarEvent[] = [];
  
      this.recurringEvents.forEach((event) => {
        const rule = new RRule({
          ...event.rrule,
          dtstart: moment(viewRender.period.start).startOf('day').toDate(),
          until: moment(viewRender.period.end).endOf('day').toDate(),
        });
  
        rule.all().forEach((date) => {
          newRecurringEvents.push({
            title: event.title,
            color: event.color,
            start: moment(date).toDate(),
            allDay: true,
          });
        });
      });
  
      // Combine recurring + regular events
      this.events = [
        ...newRecurringEvents,
        ...this.events.filter(e => !e.meta?.recurring), // Avoid duplicates
      ];
  
      this.refresh.next();
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
