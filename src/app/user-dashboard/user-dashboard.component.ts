import { Component, HostListener, OnInit } from '@angular/core';
import { UserData } from '../models/user.model';
import { DataService } from '../services/app-service/data.service';
import { UserSectionComponent } from '../user-section/user-section.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [UserSectionComponent, CommonModule, FormsModule],
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.scss'
})
export class UserDashboardComponent implements OnInit {
  userData: UserData | undefined;
  loading: boolean = true;
  username: string = '';
  lastUsername: string = '';
  info: string = '';

  constructor(private dataService: DataService) {}

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    const stickyElement = document.getElementById('stickyInput');
    if (stickyElement) {
      const stickyPosition = stickyElement.getBoundingClientRect().top;
      if (stickyPosition <= 20) {
        stickyElement.classList.add('sticky-shadow');
      } else {
        stickyElement.classList.remove('sticky-shadow');
      }
    }
  }

  ngOnInit(): void {
    this.dataService.userDataSubject.subscribe((data) => {
      if (data) {
        this.userData = data;
        this.loading = false;
      }
    });
  }

  fetchNewData(): void {
    this.userData = undefined;
    this.initUser();
  }

  initUser(): void {    
    this.info = '';
    if (this.lastUsername.length > 0) {
      this.dataService.leaveChannel(this.lastUsername);
      this.lastUsername = '';
    }
    this.dataService.initUser(this.username).subscribe({
      next: (data) => {
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 409) {
          this.fetchData();
          return;
        }
        this.info = 'User was not previously initialized. Please wait a couple minutes for data to be accumulated before trying again.';
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  fetchData(): void {    
    this.dataService.getUserData(this.username).subscribe({
      next: (data) => {
        if (!this.userData) {
          this.lastUsername = this.username;
          this.dataService.joinChannel(this.username);

          // Give google charts time to render before collapsing all to prevent label issues
          setTimeout(() => {
            this.collapseAll();
          }, 500);
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
