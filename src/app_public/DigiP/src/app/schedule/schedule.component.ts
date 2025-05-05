import { Component } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { GoogleCalendarService } from '../services/google-calendar.service';
import { ScheduleService } from '../services/schedule.service';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.css']
})
export class ScheduleComponent {
  events: any[] = [];
  tasks: any[] = [];
  combined: any[] = [];
  filteredEvents: any[] = [];
  viewMode: 'table' | 'list' = 'table';
  timeFilter: 'all' | 'day' | 'week' | 'month' = 'all';

  selectedDate: Date = new Date();

  constructor(private calService: GoogleCalendarService, private scheduleService: ScheduleService) {}
  /**
   * populate table/list with google events and tasks, sorted chronologically
   */
  ngOnInit() {
    this.calService.getTaskfromLists('primary').subscribe(tasks => {
      this.tasks = tasks.map(task => ({ ...task, type: 'task' }));
      this.checkArrays()
    });
    this.calService.getEvents().subscribe(events => {
      this.events = events
      .map((event: any) => ({ ...event, type: 'event' }))
      .sort((a: any, b: any) =>
        new Date(a.start.dateTime).getTime() - new Date(b.start.dateTime).getTime()
      );
      this.checkArrays();
    });
  }
  /**
   * updates combined array of tasks and events and filters them
   */
  checkArrays() {
    this.updateCombArray();
      this.filterEvents();
      console.log("combined array:", this.filteredEvents);
  }

  updateCombArray() {
    this.combined = [...this.events, ...this.tasks];

  //Sorting events vs task
  this.combined.sort((a: any, b: any) => {
    const aDate = a.type === 'event' ? new Date(a.start.dateTime) : new Date(a.due);
    const bDate = b.type === 'event' ? new Date(b.start.dateTime) : new Date(b.due);
    return aDate.getTime() - bDate.getTime();
  });
  }
  /**
   * filter events/tasks based on if user picks day, week, month view, etc.
   */
  filterEvents() {
    const selected = new Date(this.selectedDate);
    selected.setHours(0, 0, 0, 0);

    this.filteredEvents = this.combined.filter(item => {
      let itemDate: Date;

      if (item.type === 'event') {
        itemDate = new Date(item.start.dateTime);
      } else if (item.type === 'task') {
        if (!item.due) return false;
        itemDate = new Date(item.due);
      } else {
        return false;
      }

      if (this.timeFilter === 'day') {
        const nextDay = new Date(selected);
        nextDay.setDate(nextDay.getDate() + 1);
        return itemDate >= selected && itemDate < nextDay;
      }

      if (this.timeFilter === 'week') {
        const startOfWeek = new Date(selected);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 7);
        return itemDate >= startOfWeek && itemDate < endOfWeek;
      }

      if (this.timeFilter === 'month') {
        return (
          itemDate.getFullYear() === selected.getFullYear() &&
          itemDate.getMonth() === selected.getMonth()
        );
      }

      return true;
    });
    // extra sorrting just incase
    this.filteredEvents.sort((a: any, b: any) => {
      const aDate = a.type === 'event' ? new Date(a.start.dateTime) : new Date(a.due);
      const bDate = b.type === 'event' ? new Date(b.start.dateTime) : new Date(b.due);
      return aDate.getTime() - bDate.getTime();
    });
  }

  /**
   * filter events/tasks based off custom date change
   * @param event 
   */
  onDateChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.selectedDate = new Date(input.value);
    this.filterEvents();
  }
  
  
  toggleView(mode: 'table' | 'list') {
    this.viewMode = mode;
  }

  /**
   * change date display to be user friendly
   * @param start 
   * @param end 
   * @returns 
   */
  formatEventDate(start: string, end: string): string {
    const startDate = new Date(start);
    const endDate = new Date(end);

    const dateStr = `${startDate.getMonth() + 1}/${startDate.getDate()}/${startDate.getFullYear().toString().slice(-2)}`;
    const formatTime = (date: Date) =>
      date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

    return `${dateStr} ${formatTime(startDate)} - ${formatTime(endDate)}`;
  }
  /**
   * change date to be user friendly
   * @param due 
   * @returns 
   */
  formatTaskDate(due: string): string {
    const date = new Date(due);
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear().toString().slice(-2)}`;
  }

  /**
   * format data to be exported to CSV file
   */
  exportCSV() {
    const headers = ['Title', 'Date & Time', 'Description/Status'];
    const rows = this.filteredEvents.map(item => {
      const title = item.type === 'event' ? item.summary : item.title;
      const dateTime = item.type === 'event'
        ? this.formatEventDate(item.start.dateTime, item.end.dateTime)
        : this.formatTaskDate(item.due);
      const descriptionOrStatus = item.type === 'event'
        ? (item.description || '')
        : (item.status === 'needsAction' ? 'Not Started' : (item.status || ''));
  
      return [title, dateTime, descriptionOrStatus];
    });
  
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

   /**
   * format data to be exported to PDF file
   */
  exportToPDF(): void {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Schedule Export', 14, 15);

    const tableData = this.filteredEvents.map(item => {
      const title = item.type === 'event' ? item.summary : item.title;
      const dateTime = item.type === 'event'
        ? this.formatEventDate(item.start.dateTime, item.end.dateTime)
        : this.formatTaskDate(item.due);
      const descriptionOrStatus = item.type === 'event'
        ? (item.description || '')
        : (item.status === 'needsAction' ? 'Not Started' : (item.status || ''));
  
      return [title, dateTime, descriptionOrStatus];
    });

    autoTable(doc, {
      head: [['Title', 'Date', 'Description/Status']],
      body: tableData,
      startY: 25,
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [240, 173, 78] }
    });

    doc.save('schedule.pdf');
  }
  
}
