import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TaskList } from './models/tasklist.model';
import { Task } from './models/tasks.model';

@Injectable({
  providedIn: 'root'
})
export class GoogleCalendarService {
  private calUrl = '/api/calendar';
  private taskUrl = '/api/tasks';

  constructor(private http: HttpClient) { }

  getEvents(): Observable<any> {
    // check in this file if there are recurring events and add a tag to them
    return this.http.get<any>(this.calUrl);
  }

  addEvent(event: any): Observable<any> {
    return this.http.post<any>(this.calUrl, event);
  }
  sendPayload() {
    
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
