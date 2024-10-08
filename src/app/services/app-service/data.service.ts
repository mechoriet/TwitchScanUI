import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { ChannelMessageCount, ChannelStatus, InitiatedChannel, UserData } from '../../models/user.model';
import * as signalR from '@microsoft/signalr';
import { Result } from '../../models/result';
import { HistoryData, HistoryTimeline } from '../../models/historical.model';
import { ChatMessage } from '../../models/chat-message.model';
import { backendUrl } from '../../general/variables';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private hubConnection: signalR.HubConnection;
  private reconnectionAttempt = 0;
  private maxReconnectionAttempts = 5;
  private reconnectionDelay = 5000; // 5 seconds
  private channelName: string = '';

  // Subject for successful connection to SignalR
  connectionEstablished = new BehaviorSubject<boolean>(false);
  // Subject for new User Data coming in from SignalR
  userDataSubject = new Subject<UserData>();
  // Subject to handle image URL updates
  imageUrlSubject = new Subject<string>();
  // Subject to handle online status updates
  onlineStatusSubject = new Subject<ChannelStatus>();
  // Subject to handle message count updates
  messageCountSubject = new Subject<ChannelMessageCount>();
  // Subject to handle channel messages
  messageSubject = new Subject<ChatMessage>();

  constructor(private http: HttpClient) {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(backendUrl + 'twitchHub')
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
        this.connectionEstablished.next(true);
      })
      .catch(err => {
        console.error('Error while starting connection: ' + err);
        this.scheduleReconnection();
        this.connectionEstablished.next(false);
      });

    this.hubConnection.onreconnected(() => {
      console.log('Reconnected to the SignalR hub.');
      this.reconnectionAttempt = 0;
      this.connectionEstablished.next(true);
    });

    this.hubConnection.onreconnecting(() => {
      console.log('Attempting to reconnect to SignalR hub...');
    });

    this.hubConnection.onclose(() => {
      console.log('SignalR connection closed.');
      this.scheduleReconnection();
      this.connectionEstablished.next(false);
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

    // Handle online status updates
    this.hubConnection.on('ReceiveStatus', (channelStatus: ChannelStatus) => {
      this.onlineStatusSubject.next(channelStatus);
    });

    // Handle message count updates
    this.hubConnection.on('ReceiveMessageCount', (channelName: string, messageCount: number) => {
      this.messageCountSubject.next({ channelName, messageCount });
    });

    // Handle channel messages
    this.hubConnection.on('ReceiveChannelMessage', (message: ChatMessage) => {
      this.messageSubject.next(message);
    });
  }

  getUserThumbnail(username: string): string {
    const timestamp = new Date().getTime();
    return `https://static-cdn.jtvnw.net/previews-ttv/live_user_${username}-440x248.jpg?timestamp=${timestamp}`;
  }

  joinChannel(channelName: string): void {
    this.channelName = channelName;
    this.hubConnection.invoke('JoinChannel', channelName)
      .catch(err => console.error('Error while joining channel: ' + err));
  }

  leaveChannel(channelName: string): void {
    this.channelName = '';
    this.hubConnection.invoke('LeaveChannel', channelName)
      .catch(err => console.error('Error while leaving channel: ' + err));
  }

  getUserData(channelName: string): Observable<UserData> {
    return this.http.get<UserData>(backendUrl + "Twitch/GetChannelStatistics?channelName=" + channelName);
  }

  getViewCountHistory(channelName: string): Observable<HistoryTimeline[]> {
    return this.http.get<HistoryTimeline[]>(backendUrl + "Twitch/GetViewCountHistory?channelName=" + channelName);
  }

  getHistoryByKey(channelName: string, key: string): Observable<HistoryData> {
    return this.http.get<HistoryData>(backendUrl + "Twitch/GetHistoryByKey?channelName=" + channelName + "&key=" + key);
  }

  initUser(channelName: string): Observable<Result<object>> {
    if (channelName.includes(',')) {
      return this.initMultipleUsers(channelName.split(','));
    }

    return this.http.post<Result<object>>(backendUrl + "Twitch/Init?channelName=" + channelName, {});
  }

  private initMultipleUsers(channelNames: string[]): Observable<Result<object>> {
    return this.http.post<Result<object>>(backendUrl + "Twitch/InitMultiple", channelNames);
  }

  removeUser(channelName: string): Observable<void> {
    const accessToken = localStorage.getItem('access_token');
    return this.http.post<void>(backendUrl + "Twitch/Remove?channelName=" + channelName, {}, {
      headers: {
        'AccessToken': accessToken || ''
      }
    });
  }

  getInitiatedChannels(): Observable<InitiatedChannel[]> {
    return this.http.get<InitiatedChannel[]>(backendUrl + "Twitch/GetInitiatedChannels");
  }

  addTextToObserve(channelName: string, message: string): Observable<void> {
    return this.http.post<void>(backendUrl + "Twitch/AddTextToObserve?channelName=" + channelName + "&message=" + message, {});
  }
}