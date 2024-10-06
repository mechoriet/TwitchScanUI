import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { InitiatedChannel, UserData } from '../models/user.model';
import { DataService } from '../services/app-service/data.service';
import { UserSectionComponent } from '../user-section/user-section.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Result } from '../models/result';
import { ThumbnailComponent } from "../user-section/users/thumbnail.component";
import { HistoryTimeline } from '../models/historical.model';
import { HeatmapSelectionComponent } from './heatmap-selection/heatmap-selection.component';
import { getFormattedDateSince, getTimeSince } from '../helper/date.helper';
import { moveAnimation, listAnimation, fadeInOut, expandCollapse, fadeInOutSlow, fadeInOutFast, fadeOut } from './user-dashboard.animations';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { NumberAbbreviatorPipe } from '../pipes/number-abbreviator.pipe';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.scss',
  imports: [
    UserSectionComponent,
    CommonModule,
    FormsModule,
    ThumbnailComponent,
    HeatmapSelectionComponent,
    DragDropModule,
    NumberAbbreviatorPipe,
    RouterModule
  ],
  animations: [
    moveAnimation,
    listAnimation,
    fadeOut,
    fadeInOut,
    expandCollapse,
    fadeInOutSlow,
    fadeInOutFast
  ]
})
export class UserDashboardComponent implements OnInit, OnDestroy {
  viewCountHistory: HistoryTimeline[] = [];
  initiatedChannels: InitiatedChannel[] = [];
  userData: UserData | undefined;
  loading: boolean = false;
  isOnline: boolean = false;
  notDismissed: boolean = true;
  username: string = '';
  lastUsername: string = '';
  info: string = '';
  channelFilter: string = '';

  private subscriptions: Subscription[] = [];

  getFormattedDateSince = getFormattedDateSince;
  getTimeSince = getTimeSince;

  constructor(private route: ActivatedRoute, private router: Router, private dataService: DataService) {
    const routeSubscription = this.route.paramMap.subscribe(params => {
      const channel = params.get('channel');
      if (channel) {
        this.username = channel;
        this.fetchData();
      } else {
        this.fetchInitiatedChannels();
      }
    });
    this.subscriptions.push(routeSubscription);
  }

  saveDismissed(): void {
    this.notDismissed = false;
    localStorage.setItem('dismissed', 'true');
  }

  ngOnInit(): void {
    this.loading = true;
    const userDataSubscription = this.dataService.userDataSubject.subscribe({
      next: (data) => {
        if (data) {
          this.userData = data;
          this.loading = false;
          this.isOnline = this.isChannelOnline(this.username);
        }
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        this.info = 'An error occurred while fetching user data. Please try again later.';
      }
    });
    this.subscriptions.push(userDataSubscription);

    const onlineStatusSubscription = this.dataService.onlineStatusSubject.subscribe({
      next: (data) => {
        if (data) {
          this.initiatedChannels.forEach((channel) => {
            if (channel.channelName === data.channelName) {
              channel.isOnline = data.isOnline;
              channel.messageCount = data.messageCount;
              channel.viewerCount = data.viewerCount;
              channel.uptime = data.uptime;
            }
          });
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
    this.subscriptions.push(onlineStatusSubscription);

    const messageCountSubscription = this.dataService.messageCountSubject.subscribe({
      next: (data) => {
        this.initiatedChannels.forEach((channel) => {
          if (channel.channelName === data.channelName) {
            channel.messageCount = data.messageCount;
          }
        });
        this.sortInitiatedChannels();
      },
      error: (err) => {
        console.error(err);
      }
    });
    this.subscriptions.push(messageCountSubscription);

    const dismissed = localStorage.getItem('dismissed');
    if (dismissed) {
      this.notDismissed = false;
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  sortInitiatedChannels(): void {
    this.initiatedChannels = this.initiatedChannels.sort((a, b) => {
      if (a.isOnline && !b.isOnline) {
        return -1;
      }
      if (!a.isOnline && b.isOnline) {
        return 1;
      }
      return b.messageCount - a.messageCount;
    });
  }

  initUser(): void {
    if (this.username.length === 0) {
      this.info = 'Please enter a username to fetch data.';
      return;
    }

    this.info = '';
    this.username = this.username.toLowerCase().trim();
    if (this.lastUsername.length > 0) {
      this.dataService.leaveChannel(this.lastUsername);
      this.lastUsername = '';
    }
    const initUserSubscription = this.dataService.initUser(this.username).subscribe({
      next: (data) => {
        this.initiatedChannels.push(new InitiatedChannel(this.username));
      },
      error: (err) => {
        if (err.status === 409) {
          this.router.navigate([this.username]);
          return;
        }
        if (err.status === 403) {
          this.info = (err.error as Result<object>).error?.errorMessage ?? 'An error occurred while fetching data. Please try again later.';
          return
        }
      }
    });
    this.subscriptions.push(initUserSubscription);
  }

  isChannelOnline(username: string): boolean {
    return this.initiatedChannels.find(channel => channel.channelName === username)?.isOnline ?? false;
  }

  fetchInitiatedChannels(): void {
    const initiatedChannelsSubscription = this.dataService.getInitiatedChannels().subscribe({
      next: (data) => {
        // First sort by online status, then by message count
        this.loading = false;
        this.initiatedChannels = data;
        this.sortInitiatedChannels();
      },
      error: (err) => {
        this.loading = false;
        console.error(err);
      }
    });
    this.subscriptions.push(initiatedChannelsSubscription);
  }

  fetchNewData(): void {
    this.info = '';
    this.initUser();
  }

  fetchViewCountEvent(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (!target.value) {
      this.fetchData();
      return;
    }
    this.fetchViewCountHistory(target.value);
  }

  fetchViewCountHistory(key: string): void {
    const viewCountHistorySubscription = this.dataService.getHistoryByKey(this.username, key).subscribe({
      next: (data) => {
        this.userData = data.statistics;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.info = 'An error occurred while fetching data. Please try again later.';
      },
    });
    this.subscriptions.push(viewCountHistorySubscription);
  }

  onHistoryDateSelected(id: string | undefined): void {
    if (!id) {
      this.fetchData();
      return;
    }

    this.dataService.leaveChannel(this.lastUsername);
    this.fetchViewCountHistory(id);
  }

  fetchData(): void {
    console.log('Fetching data for', this.username);
    this.loading = true;
    const fetchDataSubscription = this.dataService.getUserData(this.username).subscribe({
      next: (data) => {
        if (!this.userData) {
          this.lastUsername = this.username;
          this.dataService.joinChannel(this.username);
          this.fetchHistory();
        }
        this.userData = data;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.info = 'An error occurred while fetching data. Please try again later.';
      },
    });
    this.subscriptions.push(fetchDataSubscription);
  }

  fetchHistory() {
    const historySubscription = this.dataService.getViewCountHistory(this.username).subscribe({
      next: (data) => {
        this.viewCountHistory = data;
      },
      error: (error) => {
        console.error(error);
      }
    });
    this.subscriptions.push(historySubscription);
  }

  filteredChannels() {
    if (!this.channelFilter) {
      return this.initiatedChannels;
    }
    return this.initiatedChannels.filter(channel =>
      channel.channelName.toLowerCase().includes(this.channelFilter.toLowerCase())
    );
  }

  trackByChannelId(index: number, item: InitiatedChannel) {
    return item.channelName;
  }

  reset(): void {
    this.dataService.leaveChannel(this.lastUsername);
    this.router.navigate(['']);
    this.fetchInitiatedChannels();

    this.userData = undefined;
    this.viewCountHistory = [];
    this.username = '';
    this.info = '';
    this.loading = false;
    this.isOnline = false;
  }
}
