import { Component } from '@angular/core';
import { GoogleCalendarService } from '../google-calendar.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.css']
})
export class ScheduleComponent {
  events: any[] = [];
  viewMode: 'table' | 'list' = 'table'; // toggle state

  constructor(private calService: GoogleCalendarService) {}

  ngOnInit() {
    this.calService.getEvents().subscribe(events => {
      this.events = events.sort((a: any, b: any) => 
        new Date(a.start.dateTime).getTime() - new Date(b.start.dateTime).getTime()
      );
    });
  }

  toggleView(mode: 'table' | 'list') {
    this.viewMode = mode;
  }

  exportCSV() {
    const headers = ['Summary', 'Date & Time', 'Description'];
    const rows = this.events.map(event => [
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

  formatEventDate(start: string, end: string): string {
    const startDate = new Date(start);
    const endDate = new Date(end);
  
    const dateStr = `${startDate.getMonth() + 1}/${startDate.getDate()}/${startDate.getFullYear().toString().slice(-2)}`;
    
    const formatTime = (date: Date) =>
      date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  
    return `${dateStr} ${formatTime(startDate)} - ${formatTime(endDate)}`;
  }
  

  exportToPDF(): void {
    const doc = new jsPDF();
  
    // Optional: title
    doc.setFontSize(18);
    doc.text('Schedule Export', 14, 15);
  
    const tableData = this.events.map(event => [
      event.summary,
      this.formatEventDate(event.start.dateTime, event.end.dateTime),
      event.description || ''
    ]);
  
    autoTable(doc, {
      head: [['Summary', 'Date & Time', 'Description']],
      body: tableData,
      startY: 25,
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [240, 173, 78] // like burlywood
      }
    });
  
    doc.save('schedule.pdf');
  }
  
}
