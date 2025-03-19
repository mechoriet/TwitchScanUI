import { Component, Input, OnDestroy } from '@angular/core';
import { TopUsersComponent } from './top-users.component';
import { CommonModule } from '@angular/common';
import { TopMessagesComponent } from "./top-messages.componen";
import { UserData } from '../../models/user.model';
import { DataService } from '../../services/app-service/data.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-sentiment-analysis',
  standalone: true,
  template: `
    <div class="m-0 h-100 w-100">
        <div class="row m-0 w-100 h-100">
          <div class="col-12 col-md-6 h-100">
            <ng-container>
              <app-top-users
                class="mb-2"
                [users]="userData.SentimentAnalysis.topPositiveUsers"
              ></app-top-users>
            </ng-container>
          </div>
          <div class="col-12 col-md-6 h-100">
            <ng-container>
              <app-top-users
                [users]="userData.SentimentAnalysis.topNegativeUsers"
              ></app-top-users>
            </ng-container>
          </div>          
        </div>
    </div>
  `,
  imports: [TopUsersComponent, CommonModule],
})
export class SentimentAnalysisComponent implements OnDestroy {
  userData!: UserData;
  @Input() averageMessageLength: number = 0;
  subscriptions: Subscription = new Subscription();

  constructor(public dataService: DataService) {
    this.userData = dataService.getUserData();
    this.subscriptions.add(this.dataService.userData$.subscribe((userData) => {
      this.userData = userData;
    }));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  hasPositiveUsers(): boolean {
    return !!this.userData?.SentimentAnalysis && this.userData.SentimentAnalysis.topPositiveUsers.length > 0;
  }

  hasNegativeUsers(): boolean {
    return !!this.userData?.SentimentAnalysis && this.userData?.SentimentAnalysis.topNegativeUsers.length > 0;
  }
}
