import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserData } from '../../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private apiUrl = 'https://twitch.dreckbu.de/Twitch';

  constructor(private http: HttpClient) {}

  getUserData(channelName: string): Observable<UserData> {
    return this.http.get<UserData>(this.apiUrl + "/GetChannelStatistics?channelName=" + channelName);
  }

  initUser(channelName: string): Observable<void> {
    return this.http.post<void>(this.apiUrl + "/Init?channelName=" + channelName, {});
  }
}
