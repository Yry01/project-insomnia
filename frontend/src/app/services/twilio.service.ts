import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TwilioService {
  private readonly apiUrl = 'http://localhost:3000/send-sms';

  constructor(private http: HttpClient) {}

  sendSMS(to: string, body: string): Observable<any> {
    return this.http.post(this.apiUrl, { to, body });
  }
}
