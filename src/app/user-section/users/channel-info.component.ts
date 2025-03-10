import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserData } from '../../models/user.model';
import { DataService } from '../../services/app-service/data.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-channel-info',
  standalone: true,
  template: `
  <div class="card border-secondary bg-dark text-light text-center m-0 h-100 p-2 overflow-auto">
    <table class="table table-transparent text-light w-100 h-100">
        <tbody>
            <tr>
                <th class="text-start p-0 px-1 w-100 border-secondary text-warning">
                    <i class="fa-solid me-1 fa-gamepad"></i> Current Game
                </th>
                <td class="text-start p-0 px-1 w-100 border-secondary text-truncate">{{ userData.ChannelMetrics.currentGame }}</td>
            </tr>
            <tr>
                <th class="text-start p-0 px-1 w-100 border-secondary text-warning">
                    <i class="fa-solid me-1 fa-clock"></i> Uptime
                </th>
                <td class="text-start p-0 px-1 w-100 border-secondary text-truncate">{{ formatDate(userData.ChannelMetrics.uptime) }}</td>
            </tr>
            <tr>
                <th class="text-start p-0 px-1 w-100 border-secondary text-warning">
                    <i class="fa-solid me-1 fa-eye"></i> Current Viewers
                </th>
                <td class="text-start p-0 px-1 w-100 border-secondary text-truncate">{{ userData.ChannelMetrics.viewerStatistics.currentViewers }}</td>
            </tr>
            <tr>
                <th class="text-start p-0 px-1 w-100 border-secondary text-warning">
                    <i class="fa-solid me-1 fa-chart-line"></i> Average Viewers
                </th>
                <td class="text-start p-0 px-1 w-100 border-secondary text-truncate">{{ formatAverage(userData.ChannelMetrics.viewerStatistics.averageViewers) }}</td>
            </tr>
            <tr>
                <th class="text-start p-0 px-1 w-100 border-secondary text-warning">
                    <i class="fa-solid me-1 fa-users"></i> Peak Viewers
                </th>
                <td class="text-start p-0 px-1 w-100 border-secondary text-truncate">{{ userData.ChannelMetrics.viewerStatistics.peakViewers }}</td>
            </tr>
            <tr>
                <th class="text-start p-0 px-1 w-100 border-secondary text-warning">
                    <i class="fa-solid me-1 fa-comment"></i> Unique Chatter
                </th>
                <td class="text-start p-0 px-1 w-100 border-secondary text-truncate">{{ userData.UniqueChatters }} ({{ (activeChatterPercentage() ?? 0).toFixed(2) }}%)</td>
            </tr>
            <tr>
                <th class="text-start p-0 px-1 w-100 border-secondary text-warning">
                    <i class="fa-solid me-1 fa-comments"></i> Messages
                </th>
                <td class="text-start p-0 px-1 w-100 border-secondary text-truncate">{{ userData.TotalMessages }}</td>
            </tr>
            <tr>
                <th class="text-start p-0 px-1 w-100 border-secondary text-warning">
                    <i class="fa-solid me-1 fa-ruler"></i> Average Message Length
                </th>
                <td class="text-start p-0 px-1 w-100 border-secondary text-truncate">{{ formatAverage(userData.AverageMessageLength) }}</td>
            </tr>
            <tr>
                <th class="text-start p-0 px-1 w-100 border-secondary text-warning">
                    <i class="fa-solid me-1 fa-file-word"></i> Unique Words
                </th>
                <td class="text-start p-0 px-1 w-100 border-secondary text-truncate">{{ userData.UniqueWords }}</td>
            </tr>
            <tr>
                <th class="text-start p-0 px-1 w-100 border-secondary text-warning">
                    <i class="fa-solid me-1 fa-hourglass"></i> Message Interval
                </th>
                <td class="text-start p-0 px-1 w-100 border-secondary text-truncate">{{ formatMessageInterval(userData.MessageIntervalMs) }}</td>
            </tr>
            <tr>
                <th class="text-start p-0 px-1 w-100 border-secondary text-warning">
                    <i class="fa-solid me-1 fa-link"></i> Links Shared
                </th>
                <td class="text-start p-0 px-1 w-100 border-secondary text-truncate">{{ userData.LinksShared }}</td>
            </tr>
            <tr>
                <th class="text-start p-0 px-1 w-100 border-secondary text-warning">
                    <i class="fa-solid me-1 fa-users-between-lines"></i> Total Raiders
                </th>
                <td class="text-start p-0 px-1 w-100 border-secondary text-truncate">{{ userData.RaidStatistic?.totalRaids }}</td>
            </tr>
            <tr>
                <th class="text-start p-0 px-1 w-100 border-secondary text-warning">
                    <i class="fa-solid me-1 fa-ban"></i> Total Timeouts
                </th>
                <td class="text-start p-0 px-1 w-100 border-secondary text-truncate">{{ userData.TotalTimeouts.totalTimeouts }}</td>
            </tr>
            <tr>
                <th class="text-start p-0 px-1 w-100 border-secondary text-warning">
                    <i class="fa-solid me-1 fa-hourglass"></i> Average Timeout Duration
                </th>
                <td class="text-start p-0 px-1 w-100 border-secondary text-truncate">{{ userData.TotalTimeouts.averageTimeoutDuration / 60 | number: '1.0-0' }} min</td>
            </tr>
            <tr>
                <th class="text-start p-0 px-1 w-100 border-secondary text-warning">
                    <i class="fa-solid me-1 fa-gavel"></i> Total Bans
                </th>
                <td class="text-start p-0 px-1 w-100 border-secondary text-truncate">{{ userData.TotalBans.totalBans }}</td>
            </tr>
        </tbody>
    </table>
</div>
  `,
  imports: [CommonModule],
  styles: [
    `
      .message-info {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-evenly;
        gap: 10px;
      }

      .card {
        border-radius: 0.5rem;
      }

      .table {
        margin-bottom: 0;
      }

      .table th, .table td {
        padding: 0.75rem;
        vertical-align: middle;
      }

      .table-responsive {
        width: 100%;
        overflow-x: auto;
      }

      .badge {
        font-size: .75rem;
      }
    `,
  ],
})
export class ChannelInfoComponent {
  userData!: UserData;
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

  activeChatterPercentage(): number | undefined {
    return this.userData.UniqueChatters ? (this.userData.UniqueChatters / this.userData.ChannelMetrics.viewerStatistics.peakViewers) * 100 : 0;
  }

  formatMessageInterval(intervalMs: number): string {
    if (intervalMs < 1000) {
      return `${intervalMs.toFixed(2)} ms`;
    } else if (intervalMs < 60000) {
      return `${(intervalMs / 1000).toFixed(2)} s`;
    } else if (intervalMs < 3600000) {
      return `${(intervalMs / 60000).toFixed(2)} min`;
    } else {
      return `${(intervalMs / 3600000).toFixed(2)} h`;
    }
  }

  formatAverage(average: number): string {
    return Math.round(average).toLocaleString();
  }

  formatDate(dateString: string): string {
    return dateString.includes('.') ? dateString.split('.')[0] : dateString;
  }
}
