import { Component, Input } from '@angular/core';
import { SentimentAnalysis } from '../../models/sentiment.model';
import { SentimentOverTimeComponent } from './sentiment-over-time.component';
import { TopUsersComponent } from './top-users.component';
import { CommonModule } from '@angular/common';
import { TopMessagesComponent } from "./top-messages.componen";

@Component({
  selector: 'app-sentiment-analysis',
  standalone: true,
  template: `
    <div class="card border-secondary bg-dark text-light">
      <h4 (click)="redrawTrigger = !redrawTrigger"
      class="pointer"
      data-bs-toggle="collapse"
      data-bs-target="#sentimentAnalysisCollapse"
      aria-expanded="true"
      aria-controls="sentimentAnalysisCollapse"><i class="fa-solid fa-magnifying-glass-chart me-2 text-warning"></i> Sentiment Analysis</h4>

      <div id="sentimentAnalysisCollapse" class="collapse">
        <app-sentiment-over-time
          class="p-2"
          [data]="sentiment.sentimentOverTime"
          [redrawTrigger]="redrawTrigger"
        ></app-sentiment-over-time>
        <div class="row">
          <div class="col-12 col-md-6">
            <ng-container *ngIf="hasPositiveUsers()">
              <app-top-users
                class="mb-2"
                [title]="titlePositive"
                [users]="sentiment.topPositiveUsers"
                [positive]="true"
                [redrawTrigger]="redrawTrigger"
              ></app-top-users>
            </ng-container>
          </div>
          <div class="col-12 col-md-6">
            <ng-container *ngIf="hasNegativeUsers()">
              <app-top-users
                [title]="titleNegative"
                [users]="sentiment.topNegativeUsers"
                [positive]="false"
                [redrawTrigger]="redrawTrigger"
              ></app-top-users>
            </ng-container>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .card {
        border: 1px solid #ccc;
        padding: 1rem;
        margin: 0.5rem 0;
      }
    `,
  ],
  imports: [SentimentOverTimeComponent, TopUsersComponent, CommonModule, TopMessagesComponent],
})
export class SentimentAnalysisComponent {
  @Input() sentiment!: SentimentAnalysis;
  @Input() averageMessageLength: number = 0;
  titlePositive = 'Top Positive Users';
  titleNegative = 'Top Negative Users';
  redrawTrigger = false;

  hasPositiveUsers(): boolean {
    return this.sentiment && this.sentiment.topPositiveUsers.length > 0;
  }

  hasNegativeUsers(): boolean {
    return this.sentiment && this.sentiment.topNegativeUsers.length > 0;
  }
}
