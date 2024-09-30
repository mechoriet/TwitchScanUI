import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { UserData } from '../../models/user.model';
import * as signalR from '@microsoft/signalr';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private apiUrl = 'https://twitch.dreckbu.de/';
  private hubConnection: signalR.HubConnection;
  private reconnectionAttempt = 0;
  private maxReconnectionAttempts = 5;
  private reconnectionDelay = 5000; // 5 seconds
  private channelName: string = '';

  // Observable for new User Data coming in from SignalR
  userDataSubject = new Subject<UserData>();
  imageUrlSubject = new Subject<string>(); // Subject to handle image URL updates

  constructor(private http: HttpClient) {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(this.apiUrl + 'twitchHub')
      .withAutomaticReconnect([0, 2000, 5000, 10000]) // Exponential backoff for automatic reconnect
      .build();

    this.startConnection();
    this.registerSignalREvents();
  }

  private startConnection(): void {
    this.hubConnection
      .start()
      .then(() => {
        console.log('SignalR Connection started');
        this.reconnectionAttempt = 0; // Reset reconnection attempts on successful connection
      })
      .catch(err => {
        console.error('Error while starting connection: ' + err);
        this.scheduleReconnection();
      });

    this.hubConnection.onreconnected(() => {
      console.log('Reconnected to the SignalR hub.');
      this.reconnectionAttempt = 0;
    });

    this.hubConnection.onreconnecting(() => {
      console.log('Attempting to reconnect to SignalR hub...');
    });

    this.hubConnection.onclose(() => {
      console.log('SignalR connection closed.');
      this.scheduleReconnection();
    });
  }

  private scheduleReconnection(): void {
    if (this.reconnectionAttempt < this.maxReconnectionAttempts) {
      this.reconnectionAttempt++;
      console.log(`Reconnection attempt ${this.reconnectionAttempt}`);
      setTimeout(() => this.startConnection(), this.reconnectionDelay);
    } else {
      console.error('Max reconnection attempts reached. Could not reconnect to SignalR.');
    }
  }

  private registerSignalREvents(): void {
    this.hubConnection.on('ReceiveStatistics', (data: UserData) => {
      this.userDataSubject.next(data);

      if (this.channelName.length === 0) {
        return;
      }
      // Build the URL for the Twitch preview image using the username from UserData
      // Append timestamp to ensure the browser fetches the latest version of the image
      const timestamp = new Date().getTime();
      const imageUrl = `https://static-cdn.jtvnw.net/previews-ttv/live_user_${this.channelName}-440x248.jpg?timestamp=${timestamp}`;
      this.imageUrlSubject.next(imageUrl);
    });
  }

  getUserThumbnail(username: string): string {
    const timestamp = new Date().getTime();
    return `https://static-cdn.jtvnw.net/previews-ttv/live_user_${username}-440x248.jpg?timestamp=${timestamp}`;
  }

  joinChannel(channelName: string): void {
    this.channelName = channelName;
    this.hubConnection.invoke('JoinChannel', channelName)
      .then(() => console.log('Joined channel: ' + channelName))
      .catch(err => console.error('Error while joining channel: ' + err));
  }

  leaveChannel(channelName: string): void {
    this.channelName = '';
    this.hubConnection.invoke('LeaveChannel', channelName)
      .then(() => console.log('Left channel: ' + channelName))
      .catch(err => console.error('Error while leaving channel: ' + err));
  }

  getUserData(channelName: string): Observable<UserData> {
    return this.http.get<UserData>(this.apiUrl + "Twitch/GetChannelStatistics?channelName=" + channelName);
  }

  initUser(channelName: string): Observable<void> {
    return this.http.post<void>(this.apiUrl + "Twitch/Init?channelName=" + channelName, {});
  }
}