import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, firstValueFrom, Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { TwitchLogin } from '../../models/twitch.login.model';
import { DataService } from '../app-service/data.service';
import { backendUrl, frontendUrl } from '../../general/variables';

@Injectable({
    providedIn: 'root',
})
export class TwitchAuthService {
    private clientId = 'otz0lwdmgk9zapx2jnuyh32do1qgj7';
    private redirectUri = frontendUrl + 'auth-callback';
    private twitchAuthUrl = 'https://id.twitch.tv/oauth2/authorize';
    private userAccount: BehaviorSubject<TwitchLogin | undefined> = new BehaviorSubject<TwitchLogin | undefined>(undefined);

    // Observable to expose login status
    get userAccount$(): Observable<TwitchLogin | undefined> {
        return this.userAccount.asObservable();
    }

    constructor(private http: HttpClient, private router: Router, private dataService: DataService) {
        this.refreshLogin();
    }

    // Redirect the user to Twitch for login
    loginWithTwitch(): void {
        const scopes = encodeURIComponent('user:read:email'); // Add required scopes ()
        const twitchUrl = `${this.twitchAuthUrl}?client_id=${this.clientId}&redirect_uri=${this.redirectUri}&response_type=code&scope=${scopes}`;

        // Redirect to Twitch OAuth login page
        window.location.href = twitchUrl;
    }

    // Handle the callback from Twitch, exchanging code for tokens
    handleAuthCallback(code: string): Observable<any> {
        const params = new HttpParams().set('code', code).set('redirectUri', this.redirectUri);

        // Send the code to your backend to exchange for tokens
        return this.http.get<TwitchLogin>(`${backendUrl}TwitchAuth/ExchangeCode`, { params }).pipe(
            tap((user) => {
                this.storeTokens(user);
            }), // Store tokens on success
            catchError((error) => {
                this.router.navigate(['']); // Navigate to error page if token exchange fails
                this.userAccount.next(undefined);
                throw error; // Re-throw the error to be handled further if needed
            })
        );
    }

    // Log the user in if they have valid tokens by sending a request to the backend (/RefreshToken)
    refreshLogin(): void {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
            const headers = { 'Authorization': `${refreshToken}` };
            this.http.get<TwitchLogin>(`${backendUrl}TwitchAuth/RefreshToken`, { headers }).subscribe({
                next: (user) => {
                    this.storeTokens(user);
                },
                error: (error) => {
                    this.userAccount.next(undefined);
                    console.error('Error refreshing tokens: ', error);
                }
            });
        }
    }

    // Logout the user by clearing tokens and user data
    async logout(): Promise<boolean> {
        const user = this.userAccount.getValue();
        if (!user) {
            return false;
        }
        try {
            await firstValueFrom(this.dataService.removeUser(user.displayName));
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            this.userAccount.next(undefined);
            return true;
        } catch (error) {
            console.error('Error removing user from cache: ', error);
            return false;
        }
    }

    // Store access tokens or other user data after successful login
    private storeTokens(user: TwitchLogin): void {
        this.userAccount.next(user);
        localStorage.setItem('access_token', user.accessToken);
        localStorage.setItem('refresh_token', user.refreshToken);
    }

    // Called after handling the callback and navigating to success or error
    completeLogin(): void {
        this.router.navigate(['']); // Navigate to success page after successful login
    }
}
