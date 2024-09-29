import { Component } from '@angular/core';
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
export class UserDashboardComponent {
  userData: UserData | undefined;
  loading: boolean = true;
  username: string = '';
  info: string = '';

  constructor(private dataService: DataService) {}

  fetchNewData(): void {
    this.userData = undefined;
    this.initUser();
  }

  initUser(): void {    
    this.info = '';
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
        this.info = 'User was not previously initialized. Please wait a moment for data to be accumulated. before trying again.';
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  fetchData(): void {    
    this.dataService.getUserData(this.username).subscribe({
      next: (data) => {
        this.userData = data;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.info = 'An error occurred while fetching data. Please try again later.';
      },
    });
  }
}
