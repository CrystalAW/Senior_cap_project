import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GoogleCalendarService {
  private calUrl = '/api/calendar';

  constructor(private http: HttpClient) { }

  getEvents(): Observable<any> {
    // check in this file if there are recurring events and add a tag to them
    return this.http.get<any>(this.calUrl);
  }

  addEvent(event: any): Observable<any> {
    return this.http.post<any>(this.calUrl, event);
  }

  //taskslists api methods
  getTaskLists(): Observable<any> {
    return this.http.get(`${this.calUrl}/tasklists/`);
  }

  getTaskfromLists(listId:string, task:any): Observable<any> {
    return this.http.get(`${this.calUrl}/tasklists/${listId}/tasks`, task);
  }

  createTask(listId:string, task:any): Observable<any> {
    return this.http.post(`${this.calUrl}/tasklists/${listId}/tasks`, task);
  }

  completeTask(listId: string, taskId: string): Observable<any> {
    return this.http.patch(`${this.calUrl}/tasklists/${listId}/tasks/${taskId}/complete}`, {});
  }

  deleteTask(listId:string, taskId:string): Observable<any> {
    return this.http.delete(`${this.calUrl}/tasklists/${listId}/tasks/${taskId}`);
  }
}
