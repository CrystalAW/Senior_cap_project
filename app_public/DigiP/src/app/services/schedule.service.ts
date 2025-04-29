import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, switchMap } from 'rxjs';
import { googleCreds, schedPayload } from '../models/creds.model';
import { Task } from '../models/tasks.model';


type TaskBDTuple = [Task, number];
@Injectable({
  providedIn: 'root'
})
export class ScheduleService {
  private pyUrl = 'http://localhost:5000';

  private credUrl = '/api/creds';

  constructor(private http: HttpClient) { }

  getCredentials(): Observable<any> {
      return this.http.get(this.credUrl);
  }

  generateSchedule(payload: schedPayload): Observable<any> {
    return this.http.get<googleCreds>(this.credUrl).pipe(
      map(creds => ({...payload, creds} as schedPayload)),
      switchMap(fullpayload => this.http.post<any>(`${this.pyUrl}/schedule`, fullpayload))
      );
  }

  regenerateSchedule(payload: schedPayload): Observable<any> {
    return this.http.get<googleCreds>(this.credUrl).pipe(
      map(creds => ({...payload, creds} as schedPayload)),
      switchMap(fullpayload => this.http.post<any>(`${this.pyUrl}/reset`, fullpayload))
    );
  }
}
