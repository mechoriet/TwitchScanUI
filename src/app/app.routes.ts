import { Routes } from '@angular/router';
import { UserDashboardComponent } from './user-dashboard/user-dashboard.component';
import { TwitchLoginComponent } from './user-dashboard/twitch-login/twitch-login.component';
import { UserSectionComponent } from './user-section/user-section.component';

export const routes: Routes = [
    {
        path: 'c/:channel', component: UserSectionComponent,
    },
    {
        path: 'auth-callback', component: TwitchLoginComponent
    },
    {
        path: '', component: UserDashboardComponent,
    },
];