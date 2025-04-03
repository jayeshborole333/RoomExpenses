import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RoomFellowService {
  private apiUrl = 'http://localhost:8081/api/roomfellows';

  constructor(private http: HttpClient) {}

  getRoomFellows(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}
