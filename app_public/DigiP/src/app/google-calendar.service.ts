import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GoogleCalendarService {
  private apiUrl = '/api/calendar';

  constructor(private http: HttpClient) { }

  getEvents(): Observable<any> {
    // check in this file if there are recurring events and add a tag to them
    return this.http.get<any>(this.apiUrl);
  }

  addEvent(event: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, event);
  }

}
