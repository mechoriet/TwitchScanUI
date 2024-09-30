import { Component, Input } from '@angular/core';
import { UserData } from '../models/user.model';
import { UserDashboardComponent } from '../user-dashboard/user-dashboard.component';
import { EmoteUsageComponent } from './message/emote-usage.component';
import { SentimentAnalysisComponent } from './sentiment/sentiment-analysis.component';
import { SentimentOverTimeComponent } from './sentiment/sentiment-over-time.component';
import { SubscriptionStatisticComponent } from './users/subscription-statistic.component';
import { TopUsersComponent } from './sentiment/top-users.component';
import { CommonModule } from '@angular/common';
import { PeakActivityPeriodsComponent } from './users/peak-activity-periods.component';
import { AudienceEngagementComponent } from './users/audience-engagement.component';

@Component({
  selector: 'app-user-section',
  standalone: true,
  imports: [
    UserDashboardComponent,
    UserSectionComponent,
    EmoteUsageComponent,
    SentimentAnalysisComponent,
    SentimentOverTimeComponent,
    TopUsersComponent,
    SubscriptionStatisticComponent,
    PeakActivityPeriodsComponent,
    AudienceEngagementComponent,
    CommonModule
  ],
  templateUrl: './user-section.component.html',
  styleUrl: './user-section.component.scss'
})
export class UserSectionComponent  {
  @Input({ required: true }) username: string = '';
  @Input() data!: UserData;
}
