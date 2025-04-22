import { Component } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { GoogleCalendarService } from '../google-calendar.service';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.css']
})
export class ScheduleComponent {
  events: any[] = [];
  filteredEvents: any[] = [];
  viewMode: 'table' | 'list' = 'table';
  timeFilter: 'all' | 'day' | 'week' | 'month' = 'all';

  selectedDate: Date = new Date(); // You can bind this to a datepicker later

  constructor(private calService: GoogleCalendarService) {}

  ngOnInit() {
    this.calService.getEvents().subscribe(events => {
      this.events = events.sort((a: any, b: any) =>
        new Date(a.start.dateTime).getTime() - new Date(b.start.dateTime).getTime()
      );
      this.filterEvents();
    });
  }

  filterEvents() {
    const selected = new Date(this.selectedDate);
    selected.setHours(0, 0, 0, 0);

    this.filteredEvents = this.events.filter(event => {
      const start = new Date(event.start.dateTime);

      if (this.timeFilter === 'day') {
        const nextDay = new Date(selected);
        nextDay.setDate(nextDay.getDate() + 1);
        return start >= selected && start < nextDay;
      }

      if (this.timeFilter === 'week') {
        const startOfWeek = new Date(selected);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 7);
        return start >= startOfWeek && start < endOfWeek;
      }

      if (this.timeFilter === 'month') {
        return (
          start.getFullYear() === selected.getFullYear() &&
          start.getMonth() === selected.getMonth()
        );
      }

      return true;
    });
  }

  onDateChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.selectedDate = new Date(input.value);
    this.filterEvents();
  }
  

  toggleView(mode: 'table' | 'list') {
    this.viewMode = mode;
  }

  formatEventDate(start: string, end: string): string {
    const startDate = new Date(start);
    const endDate = new Date(end);

    const dateStr = `${startDate.getMonth() + 1}/${startDate.getDate()}/${startDate.getFullYear().toString().slice(-2)}`;
    const formatTime = (date: Date) =>
      date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

    return `${dateStr} ${formatTime(startDate)} - ${formatTime(endDate)}`;
  }

  //need to add something for the tasks here instead maybe

  // createEvent(eventFormData: any) {
  //   const newEvent = {
  //     summary: eventFormData.title,
  //     description: eventFormData.description,
  //     start: {
  //       dateTime: new Date(eventFormData.start).toISOString(),
  //       timeZone: 'America/New_York',
  //     },
  //     end: {
  //       dateTime: new Date(eventFormData.end).toISOString(),
  //       timeZone: 'America/New_York',
  //     },
  //   };
  
  //   this.calService.addEvent(newEvent).subscribe({
  //     next: () => console.log('Event created'),
  //     error: (err) => console.error('Failed to create event', err)
  //   });
  // }
  


  exportCSV() {
    const headers = ['Title', 'Date & Time', 'Description'];
    const rows = this.filteredEvents.map(event => [
      event.summary,
      this.formatEventDate(event.start.dateTime, event.end.dateTime),
      event.description || ''
    ]);
    const csvContent = [headers, ...rows]
      .map(e => e.map(v => `"${v}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'schedule.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportToPDF(): void {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Schedule Export', 14, 15);

    const tableData = this.filteredEvents.map(event => [
      event.summary,
      this.formatEventDate(event.start.dateTime, event.end.dateTime),
      event.description || ''
    ]);

    autoTable(doc, {
      head: [['Summary', 'Date & Time', 'Description']],
      body: tableData,
      startY: 25,
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [240, 173, 78] }
    });

    doc.save('schedule.pdf');
  }
  
}
