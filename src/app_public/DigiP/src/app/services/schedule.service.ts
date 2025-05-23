import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, switchMap } from 'rxjs';
import { googleCreds, schedPayload } from '../models/creds.model';
import { Task } from '../models/tasks.model';


@Injectable({
  providedIn: 'root'
})
export class ScheduleService {
  private pyUrl = 'http://localhost:5000';

  private credUrl = '/api/creds';

  constructor(private http: HttpClient) { }

  /**
   * Schedule service to interact with Python backend API
   * getCredentials : gets google credentials stored in Node backend.
   * @returns 
   */
  getCredentials(): Observable<any> {
      return this.http.get(this.credUrl);
  }

  /**
   * sends the user-picked tasks from Task page and their authorized credentials to 
   * the python backend
   * @param payload 
   * @returns 
   */
  generateSchedule(payload: schedPayload): Observable<any> {
    return this.http.get<googleCreds>(this.credUrl).pipe(
      map(creds => ({...payload, creds} as schedPayload)),
      switchMap(fullpayload => this.http.post<any>(`${this.pyUrl}/schedule`, fullpayload))
      );
  }

  /**
   * sends authorized credentials back to python backend to reset scedule
   * @param payload 
   * @returns 
   */
  resetSchedule(payload: schedPayload): Observable<any> {
    return this.http.get<googleCreds>(this.credUrl).pipe(
      map(creds => ({...payload, creds} as any)),
      switchMap(fullpayload => this.http.post<any>(`${this.pyUrl}/reset`, fullpayload))
    );
  }
}
