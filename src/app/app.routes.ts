import { Routes } from '@angular/router';
import { UserDashboardComponent } from './user-dashboard/user-dashboard.component';
import { TwitchLoginComponent } from './user-dashboard/twitch-login/twitch-login.component';

export const routes: Routes = [
    { 
        path: 'auth-callback', component: TwitchLoginComponent 
    },
    {
        path: 'c/:channel', component: UserDashboardComponent
    },
    {
        path: '', component: UserDashboardComponent,
    },
];

