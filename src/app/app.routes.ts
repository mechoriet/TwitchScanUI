import { Routes } from '@angular/router';
import { UserDashboardComponent } from './user-dashboard/user-dashboard.component';

export const routes: Routes = [
    {
        path: ':channel', component: UserDashboardComponent
    },
    {
        path: '', component: UserDashboardComponent,
    },
];

