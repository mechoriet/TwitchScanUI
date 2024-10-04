import { Component, Input } from '@angular/core';
import { SentimentAnalysis } from '../../models/sentiment.model';
import { SentimentOverTimeComponent } from './sentiment-over-time.component';
import { TopUsersComponent } from './top-users.component';
import { CommonModule } from '@angular/common';
import { TopMessagesComponent } from "./top-messages.componen";
import { UserData } from '../../models/user.model';
import { EmoteUsageComponent } from "../message/emote-usage.component";

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
      aria-controls="sentimentAnalysisCollapse"><i class="fa-solid fa-magnifying-glass-chart me-2 text-warning"></i> Sentiment</h4>

      <div id="sentimentAnalysisCollapse" class="collapse show">
        <app-sentiment-over-time
          [data]="userData.SentimentAnalysis.sentimentOverTime"
          [redrawTrigger]="redrawTrigger"
        ></app-sentiment-over-time>
        <div class="row">
          <div class="col-12 col-md-6">
            <ng-container *ngIf="hasPositiveUsers()">
              <app-top-users
                class="mb-2"
                [title]="titlePositive"
                [users]="userData.SentimentAnalysis.topPositiveUsers"
                [positive]="true"
                [redrawTrigger]="redrawTrigger"
              ></app-top-users>
            </ng-container>
          </div>
          <div class="col-12 col-md-6">
            <ng-container *ngIf="hasNegativeUsers()">
              <app-top-users
                [title]="titleNegative"
                [users]="userData.SentimentAnalysis.topNegativeUsers"
                [positive]="false"
                [redrawTrigger]="redrawTrigger"
              ></app-top-users>
            </ng-container>
          </div>          
          <!-- Emote Usage -->
          <div class="col-12">
            <ng-container *ngIf="userData.EmoteUsage.length>0">
              <app-emote-usage [emotes]="userData.EmoteUsage"></app-emote-usage>
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
  imports: [SentimentOverTimeComponent, TopUsersComponent, CommonModule, TopMessagesComponent, EmoteUsageComponent],
})
export class SentimentAnalysisComponent {
  @Input({required: true}) userData!: UserData;
  @Input() averageMessageLength: number = 0;
  titlePositive = 'Top Positive Users';
  titleNegative = 'Top Negative Users';
  redrawTrigger = false;

  hasPositiveUsers(): boolean {
    return this.userData.SentimentAnalysis && this.userData.SentimentAnalysis.topPositiveUsers.length > 0;
  }

  hasNegativeUsers(): boolean {
    return this.userData.SentimentAnalysis && this.userData.SentimentAnalysis.topNegativeUsers.length > 0;
  }
}
