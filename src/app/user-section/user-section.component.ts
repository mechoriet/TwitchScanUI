import { Component, Input, OnInit } from '@angular/core';
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
import { ChannelMetricsComponent } from "./users/channel-metric.component";

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
    PeakActivityPeriodsComponent,
    AudienceEngagementComponent,
    CommonModule,
    ChannelMetricsComponent
],
  templateUrl: './user-section.component.html',
  styleUrl: './user-section.component.scss'
})
export class UserSectionComponent implements OnInit {
  @Input({ required: true }) username: string = '';
  @Input({ required: true }) isOnline: boolean = false;
  @Input() data!: UserData;
  notDismissed: boolean = true;

  saveDismissed(): void {
    this.notDismissed = false;
    localStorage.setItem('dismissedUserSection', 'true');
  }

  ngOnInit(): void {
    const dismissed = localStorage.getItem('dismissedUserSection');
    if (dismissed) {
      this.notDismissed = false;
    }
  }
}
