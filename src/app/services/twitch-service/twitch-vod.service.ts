import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { backendUrl } from '../../general/variables';
import { VodsResponse } from '../../models/vod.model';

@Injectable({
    providedIn: 'root'
})
export class TwitchVodService {
    constructor(private http: HttpClient) { }

    vodsFetchedSubject = new Subject<boolean>();

    vodsFetched$ = this.vodsFetchedSubject.asObservable();

    private getAccessToken(): string | null {
        return localStorage.getItem('access_token'); // Fetch the token from localStorage
    }

    private createHeaders(): HttpHeaders {
        const token = this.getAccessToken();
        if (token) {
            return new HttpHeaders().set('AccessToken', token);
        } else {
            throw new Error('Access token not found');
        }
    }

    getVodsFromChannel(channelName: string): Observable<VodsResponse> {
        const headers = this.createHeaders();
        return this.http.get<VodsResponse>(`${backendUrl}Twitch/GetVodsFromChannel?channelName=${channelName}`, { headers });
    }

    getChatMessagesFromVod(channelName: string, vodUrlOrId: string, date: string, viewCount: number): Observable<any> {
        const headers = this.createHeaders();
        const params = new HttpParams()
            .set('channelName', channelName)
            .set('vodUrlOrId', vodUrlOrId)
            .set('date', date)
            .set('viewCount', viewCount.toString());

        return this.http.get(`${backendUrl}Twitch/GetChatMessagesFromVod`, { headers, params });
    }
}
