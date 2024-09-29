import { Component, Input } from '@angular/core';
import { SentimentAnalysis } from '../../models/sentiment.model';
import { SentimentOverTimeComponent } from './sentiment-over-time.component';
import { TopUsersComponent } from './top-users.component';
import { CommonModule } from '@angular/common';
import { AverageMessageLengthComponent } from '../message/message-length.component';

@Component({
  selector: 'app-sentiment-analysis',
  standalone: true,
  template: `
    <div class="card bg-dark text-light">
      <h3>Sentiment Analysis</h3>
      <app-average-message-length [length]="averageMessageLength"></app-average-message-length>
      <ng-container *ngIf="hasPositiveUsers()">
        <app-top-users class="mb-2" [title]="titlePositive" [users]="sentiment.topPositiveUsers" [positive]="true"></app-top-users>
      </ng-container>
      <ng-container *ngIf="hasNegativeUsers()">
        <app-top-users [title]="titleNegative" [users]="sentiment.topNegativeUsers" [positive]="false"></app-top-users>
      </ng-container>
      <app-sentiment-over-time class="p-2" [data]="sentiment.sentimentOverTime"></app-sentiment-over-time>
    </div>
  `,
  styles: [`
    .card { border: 1px solid #ccc; padding: 1rem; margin: 0.5rem 0; }
  `],
  imports: [SentimentOverTimeComponent, TopUsersComponent, CommonModule, AverageMessageLengthComponent]
})
export class SentimentAnalysisComponent {
  @Input() sentiment!: SentimentAnalysis;
  @Input() averageMessageLength: number = 0;
  titlePositive = 'Top Positive Users';
  titleNegative = 'Top Negative Users';

  hasPositiveUsers(): boolean {
    return this.sentiment && this.sentiment.topPositiveUsers.length > 0;
  }

  hasNegativeUsers(): boolean {
    return this.sentiment && this.sentiment.topNegativeUsers.length > 0;
  }
}
