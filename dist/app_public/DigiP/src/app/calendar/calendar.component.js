var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
import { ChangeDetectionStrategy, Component, ViewChild, } from '@angular/core';
import { CalendarView } from 'angular-calendar';
import { endOfDay, isSameDay, isSameMonth, startOfDay } from 'date-fns';
import moment from 'moment-timezone';
import { RRule } from 'rrule';
import { Subject } from 'rxjs';
const colors = {
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
let CalendarComponent = (() => {
    let _classDecorators = [Component({
            selector: 'app-calendar',
            changeDetection: ChangeDetectionStrategy.OnPush,
            templateUrl: './calendar.component.html',
            styleUrls: ['./calendar.component.css']
        })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _modalContent_decorators;
    let _modalContent_initializers = [];
    let _modalContent_extraInitializers = [];
    var CalendarComponent = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _modalContent_decorators = [ViewChild('modalContent', { static: true })];
            __esDecorate(null, null, _modalContent_decorators, { kind: "field", name: "modalContent", static: false, private: false, access: { has: obj => "modalContent" in obj, get: obj => obj.modalContent, set: (obj, value) => { obj.modalContent = value; } }, metadata: _metadata }, _modalContent_initializers, _modalContent_extraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            CalendarComponent = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        modal;
        calService;
        modalContent = __runInitializers(this, _modalContent_initializers, void 0);
        view = (__runInitializers(this, _modalContent_extraInitializers), CalendarView.Month);
        CalendarView = CalendarView;
        viewDate = moment().toDate();
        modalData;
        actions = [
            {
                label: '<i class="fas fa-fw fa-pencil-alt"></i>',
                a11yLabel: 'Edit',
                onClick: ({ event }) => {
                    this.handleEvent('Edited', event);
                },
            },
            {
                label: '<i class="fas fa-fw fa-trash-alt"></i>',
                a11yLabel: 'Delete',
                onClick: ({ event }) => {
                    this.events = this.events.filter((iEvent) => iEvent !== event);
                    this.handleEvent('Deleted', event);
                },
            },
        ];
        refresh = new Subject();
        clickedDate = null;
        showAddEventBox = false;
        showEventDetails = false;
        newEventTitle = '';
        events = [];
        activeDayIsOpen = true;
        viewPeriod;
        recurringEvents = [];
        constructor(modal, calService) {
            this.modal = modal;
            this.calService = calService;
        }
        ngOnInit() {
            // pulls the events from google calendar
            this.calService.getEvents().subscribe((googleEvents) => {
                const mapped = googleEvents.map(this.mapGoogleToCalendarEvent);
                this.events = [...this.events, ...mapped];
                this.refresh.next();
            });
        }
        //from AC
        //if day is clicked, activated the add event box
        dayClicked({ date, events }) {
            if (isSameMonth(date, this.viewDate)) {
                if ((isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
                    events.length === 0) {
                    this.activeDayIsOpen = false;
                }
                else {
                    this.activeDayIsOpen = true;
                }
                this.viewDate = date;
            }
            this.clickedDate = date;
            this.showAddEventBox = true;
            this.newEventTitle = '';
        }
        // from AC
        eventTimesChanged({ event, newStart, newEnd, }) {
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
         * Obligatory doc: needs to be done by this weekend.
         * @param googleEvent
         * @returns
         */
        mapGoogleToCalendarEvent(googleEvent) {
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
        getAttendees(event) {
            const attendees = event?.meta?.attendees;
            if (!attendees || attendees.length === 0) {
                return 'No attendees';
            }
            return attendees.map((a) => a.email).join(', ');
        }
        // this modal template is not working. I might have to do something else. 
        handleEvent(action, event) {
            this.modalData = { event, action };
            this.modal.open(this.modalContent, { size: 'lg' });
        }
        addEvent() {
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
        deleteEvent(eventToDelete) {
            this.events = this.events.filter((event) => event !== eventToDelete);
        }
        updateCalendarEvents(viewRender) {
            if (!this.viewPeriod ||
                !moment(this.viewPeriod.start).isSame(viewRender.period.start) ||
                !moment(this.viewPeriod.end).isSame(viewRender.period.end)) {
                this.viewPeriod = viewRender.period;
                const newRecurringEvents = [];
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
        setView(view) {
            this.view = view;
        }
        closeOpenMonthViewDay() {
            this.activeDayIsOpen = false;
        }
    };
    return CalendarComponent = _classThis;
})();
export { CalendarComponent };
