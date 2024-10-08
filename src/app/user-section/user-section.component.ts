import { Component, Input, OnInit } from '@angular/core';
import { UserData } from '../models/user.model';
import { UserDashboardComponent } from '../user-dashboard/user-dashboard.component';
import { EmoteUsageComponent } from './message/emote-usage.component';
import { SentimentAnalysisComponent } from './sentiment/sentiment-analysis.component';
import { SentimentOverTimeComponent } from './sentiment/sentiment-over-time.component';
import { TopUsersComponent } from './sentiment/top-users.component';
import { CommonModule } from '@angular/common';
import { ActivityComponent } from './users/activity.component';
import { AudienceEngagementComponent } from './users/audience-engagement.component';
import { ChannelMetricsComponent } from "./users/channel-metric.component";
import { ChannelInfoComponent } from './users/channel-info.component';
import { fadeInOut } from '../user-dashboard/user-dashboard.animations';
import { ChatWindowComponent } from './users/chat-window/chat-window.component';

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
    ActivityComponent,
    AudienceEngagementComponent,
    CommonModule,
    ChannelMetricsComponent,
    ChannelInfoComponent, 
    ChatWindowComponent
],
  templateUrl: './user-section.component.html',
  styleUrl: './user-section.component.scss',
  animations: [
    fadeInOut
  ]
})
export class UserSectionComponent implements OnInit {
  @Input({ required: true }) username!: string;
  @Input({ required: true }) userData!: UserData;
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
