import { Component, HostListener, OnInit } from '@angular/core';
import { InitiatedChannel, UserData } from '../models/user.model';
import { DataService } from '../services/app-service/data.service';
import { UserSectionComponent } from '../user-section/user-section.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Result } from '../models/result';
import { ThumbnailComponent } from "../user-section/users/thumbnail.component";
import { HistoryTimeline } from '../models/historical.model';
import { trigger, transition, query, style, stagger, animate } from '@angular/animations';
import { HeatmapSelectionComponent } from './heatmap-selection/heatmap-selection.component';
import { getFormattedDateSince } from '../helper/date.helper';

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
    HeatmapSelectionComponent
  ],
  animations: [
    trigger('moveAnimation', [
      transition('void => *', []), // Prevent animation on load
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(-20px)' }),
          stagger('100ms', [
            animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true }),
        query(':leave', [
          stagger('100ms', [
            animate('300ms ease-out', style({ opacity: 0, transform: 'translateY(20px)' }))
          ])
        ], { optional: true }),
        // This will handle the move animation
        query(':enter, :leave', [
          style({ position: 'relative' }),
          animate('300ms ease-out')
        ], { optional: true }),
        query(':self', [
          animate('300ms ease-in-out', style({ transform: 'translateY(0)' }))
        ], { optional: true })
      ])
    ])
  ]
})
export class UserDashboardComponent implements OnInit {
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

  getFormattedDateSince = getFormattedDateSince;

  constructor(private dataService: DataService) { }

  saveDismissed(): void {
    this.notDismissed = false;
    localStorage.setItem('dismissed', 'true');
  }

  ngOnInit(): void {
    this.dataService.userDataSubject.subscribe({
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
    this.dataService.onlineStatusSubject.subscribe({
      next: (data) => {
        if (data) {
          this.initiatedChannels.forEach((channel) => {
            if (channel.channelName === data.channelName) {
              channel.isOnline = data.isOnline;
              channel.messageCount = data.messageCount;
            }
          });
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
    this.dataService.messageCountSubject.subscribe({
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

    this.fetchInitiatedChannels();

    const dismissed = localStorage.getItem('dismissed');
    if (dismissed) {
      this.notDismissed = false;
    }
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
    this.loading = true;
    if (this.lastUsername.length > 0) {
      this.dataService.leaveChannel(this.lastUsername);
      this.lastUsername = '';
    }
    this.dataService.initUser(this.username).subscribe({
      next: (data) => {
        this.loading = false;        
        // Add to initiated channels
        this.initiatedChannels.push(new InitiatedChannel(this.username));
      },
      error: (err) => {
        if (err.status === 409) {
          this.fetchData();
          return;
        }
        this.loading = false;
        if (err.status === 403) {
          this.info = (err.error as Result<object>).error?.errorMessage ?? 'An error occurred while fetching data. Please try again later.';
          return
        }
      }
    });
  }

  isChannelOnline(username: string): boolean {
    return this.initiatedChannels.find(channel => channel.channelName === username)?.isOnline ?? false;
  }

  fetchInitiatedChannels(): void {
    this.dataService.getInitiatedChannels().subscribe({
      next: (data) => {
        // First sort by online status, then by message count
        this.initiatedChannels = data;
        this.sortInitiatedChannels();
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  fetchNewData(): void {
    this.userData = undefined;
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
    this.dataService.getHistoryByKey(this.username, key).subscribe({
      next: (data) => {
        this.userData = data.statistics;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.info = 'An error occurred while fetching data. Please try again later.';
      },
    });
  }

  onHistoryDateSelected(id: string | undefined): void {
    if (!id) {
      this.fetchData();
      return;
    }

    this.fetchViewCountHistory(id);
  }

  fetchData(): void {
    this.dataService.getUserData(this.username).subscribe({
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
  }

  fetchHistory() {
    this.dataService.getViewCountHistory(this.username).subscribe({
      next: (data) => {
        this.viewCountHistory = data;
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  filteredChannels() {
    if (!this.channelFilter) {
      return this.initiatedChannels;
    }
    return this.initiatedChannels.filter(channel =>
      channel.channelName.toLowerCase().includes(this.channelFilter.toLowerCase())
    );
  }

  exportToJSON(): void {
    if (this.userData) {
      const dataStr = JSON.stringify(this.userData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      const exportFileDefaultName = 'user-data.json';
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    }
  }

  collapseAll() {
    const collapses = document.querySelectorAll('.collapse');
    collapses.forEach((collapse: any) => {
      if (collapse.classList.contains('show')) {
        collapse.classList.remove('show');
      } else {
        collapse.classList.add('show');
      }
    });
  }

  trackByChannelId(index: number, item: InitiatedChannel) {
    return item.channelName;
  }

  reset(): void {
    this.userData = undefined;
    this.viewCountHistory = [];
    this.username = '';
    this.info = '';
    this.loading = false;
    this.isOnline = false;
    this.fetchInitiatedChannels();
    this.dataService.leaveChannel(this.lastUsername);
  }
}
