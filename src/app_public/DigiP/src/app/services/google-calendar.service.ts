import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CalendarEvent } from 'angular-calendar';
import { Observable } from 'rxjs';
import { TaskList } from '../models/tasklist.model';
import { Task } from '../models/tasks.model';

@Injectable({
  providedIn: 'root'
})
export class GoogleCalendarService {
  private calUrl = '/api/calendar';
  private taskUrl = '/api/tasks';

  constructor(private http: HttpClient) { }

  getEvents(): Observable<any> {
    return this.http.get<any>(this.calUrl);
  }

  addEvent(event: CalendarEvent<any>): Observable<any> {
    const googleEvent = {
      summary: event.title,
      start: {
        dateTime: event.start.toISOString(),
        timeZone: 'America/New_York', 
      },
      end: {
        dateTime: event.end!.toISOString(),
        timeZone: 'America/New_York',
      },
    };
    console.log("Creating event:", googleEvent);
    return this.http.post<any>(this.calUrl, googleEvent);
  }
  
  deleteEvent(eventId: string) {
    return this.http.delete<any>(`${this.calUrl}/${eventId}`);
  }
  
  //taskslists api methods
  getTaskLists(): Observable<TaskList[]> {
    return this.http.get<TaskList[]>(`${this.taskUrl}/tasklists`);
  }

  getTaskfromLists(listId:string): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.taskUrl}/tasklists/${listId}/tasks`);
  }

  createTask(listId:string, task:any): Observable<Task> {
    return this.http.post<Task>(`${this.taskUrl}/tasklists/${listId}/tasks`, task);
  }

  completeTask(listId: string, taskId: string): Observable<Task> {
    return this.http.patch<Task>(`${this.taskUrl}/tasklists/${listId}/tasks/${taskId}/complete}`, {});
  }

  deleteTask(listId:string, taskId:string): Observable<any> {
    return this.http.delete(`${this.taskUrl}/tasklists/${listId}/tasks/${taskId}`);
  }
}
