import { Component, Input } from '@angular/core';
import { UserData } from '../models/user.model';
import { AverageMessageLengthComponent } from './message/message-length.component';
import { UserDashboardComponent } from '../user-dashboard/user-dashboard.component';
import { EmoteUsageComponent } from './message/emote-usage.component';
import { WordFrequencyComponent } from './message/word-frequency.component';
import { SentimentAnalysisComponent } from './sentiment/sentiment-analysis.component';
import { SentimentOverTimeComponent } from './sentiment/sentiment-over-time.component';
import { SubscriptionStatisticComponent } from './users/subscription-statistic.component';
import { TopUsersComponent } from './sentiment/top-users.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-section',
  standalone: true,
  imports: [
    UserDashboardComponent,
    UserSectionComponent,
    AverageMessageLengthComponent,
    EmoteUsageComponent,
    SentimentAnalysisComponent,
    SentimentOverTimeComponent,
    TopUsersComponent,
    SubscriptionStatisticComponent,
    WordFrequencyComponent,
    CommonModule
  ],
  templateUrl: './user-section.component.html',
  styleUrl: './user-section.component.scss'
})
export class UserSectionComponent  {
  @Input() username!: string;
  @Input() data!: UserData;
}
