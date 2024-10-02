import { Component, HostListener, OnInit } from '@angular/core';
import { InitiatedChannel, UserData } from '../models/user.model';
import { DataService } from '../services/app-service/data.service';
import { UserSectionComponent } from '../user-section/user-section.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Result } from '../models/result';
import { ThumbnailComponent } from "../user-section/users/thumbnail.component";

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.scss',
  imports: [
    UserSectionComponent,
    CommonModule,
    FormsModule,
    ThumbnailComponent
]
})
export class UserDashboardComponent implements OnInit {
  initiatedChannels: InitiatedChannel[] = [];
  userData: UserData | undefined;
  loading: boolean = false;
  notDismissed: boolean = true;
  username: string = '';
  lastUsername: string = '';
  info: string = '';

  constructor(private dataService: DataService) {}

  saveDismissed(): void {
    this.notDismissed = false;
    localStorage.setItem('dismissed', 'true');
  }

  ngOnInit(): void {
    this.dataService.userDataSubject.subscribe((data) => {
      if (data) {
        this.userData = data;
        this.loading = false;
      }
    });
    this.dataService.onlineStatusSubject.subscribe((data) => {
      if (data) {
        this.initiatedChannels.forEach((channel) => {
          if (channel.channelName === data.channelName) {
            channel.isOnline = data.isOnline;
            channel.messageCount = data.messageCount;
          }
        });
      }
    });

    this.fetchInitiatedChannels();

    const dismissed = localStorage.getItem('dismissed');
    if (dismissed) {
      this.notDismissed = false;
    }
  }

  fetchInitiatedChannels(): void {
    this.dataService.getInitiatedChannels().subscribe({
      next: (data) => {
        this.initiatedChannels = data;
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  fetchNewData(): void {
    this.userData = undefined;
    this.initUser();
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
        this.info = 'User was not previously initialized. Please wait a couple minutes for data to be accumulated before trying again.';
        this.fetchInitiatedChannels();
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 409) {
          this.fetchData();
          return;
        }
        if (err.status === 403) {
          this.info = (err.error as Result<object>).error?.errorMessage ?? 'An error occurred while fetching data. Please try again later.';
          return
        }
      }
    });
  }

  reset(): void {
    this.userData = undefined;
    this.username = '';
    this.info = '';
    this.loading = false;
    this.fetchInitiatedChannels();
    this.dataService.leaveChannel(this.lastUsername);
  }

  fetchData(): void {    
    this.dataService.getUserData(this.username).subscribe({
      next: (data) => {
        if (!this.userData) {
          this.lastUsername = this.username;
          this.dataService.joinChannel(this.username);
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
}
