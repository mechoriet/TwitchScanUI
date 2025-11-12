import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserData } from '../../models/user.model';
import { DataService } from '../../services/app-service/data.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-channel-info',
  standalone: true,
  template: `
    <table class="table table-transparent text-light w-100 h-100">
        <tbody>
            <tr>
                <th class="text-start p-0 px-1 w-100 border-secondary text-stat">
                    <i class="fa-solid me-1 fa-gamepad"></i> Current Game
                </th>
                <td class="text-start p-0 px-1 w-100 border-secondary text-truncate">{{ userData.ChannelMetrics.currentGame }}</td>
            </tr>
            <tr>
                <th class="text-start p-0 px-1 w-100 border-secondary text-stat">
                    <i class="fa-solid me-1 fa-clock"></i> Uptime
                </th>
                <td class="text-start p-0 px-1 w-100 border-secondary text-truncate">{{ formatDate(userData.ChannelMetrics.uptime) }}</td>
            </tr>
            <tr>
                <th class="text-start p-0 px-1 w-100 border-secondary text-stat">
                    <i class="fa-solid me-1 fa-eye"></i> Current Viewers
                </th>
                <td class="text-start p-0 px-1 w-100 border-secondary text-truncate">{{ userData.ChannelMetrics.viewerStatistics.currentViewers }}</td>
            </tr>
            <tr>
                <th class="text-start p-0 px-1 w-100 border-secondary text-stat">
                    <i class="fa-solid me-1 fa-chart-line"></i> Average Viewers
                </th>
                <td class="text-start p-0 px-1 w-100 border-secondary text-truncate">{{ formatAverage(userData.ChannelMetrics.viewerStatistics.averageViewers) }}</td>
            </tr>
            <tr>
                <th class="text-start p-0 px-1 w-100 border-secondary text-stat">
                    <i class="fa-solid me-1 fa-users"></i> Peak Viewers
                </th>
                <td class="text-start p-0 px-1 w-100 border-secondary text-truncate">{{ userData.ChannelMetrics.viewerStatistics.peakViewers }}</td>
            </tr>
            <tr>
                <th class="text-start p-0 px-1 w-100 border-secondary text-stat">
                    <i class="fa-solid me-1 fa-comment"></i> Unique Chatter
                </th>
                <td class="text-start p-0 px-1 w-100 border-secondary text-truncate">{{ userData.UniqueChatters }} ({{ (activeChatterPercentage()).toFixed(2) }}%)</td>
            </tr>
            <tr>
                <th class="text-start p-0 px-1 w-100 border-secondary text-stat">
                    <i class="fa-solid me-1 fa-comments"></i> Messages
                </th>
                <td class="text-start p-0 px-1 w-100 border-secondary text-truncate">{{ userData.TotalMessages }}</td>
            </tr>
            <tr>
                <th class="text-start p-0 px-1 w-100 border-secondary text-stat">
                    <i class="fa-solid me-1 fa-ruler"></i> Average Message Length
                </th>
                <td class="text-start p-0 px-1 w-100 border-secondary text-truncate">{{ formatAverage(userData.AverageMessageLength) }}</td>
            </tr>
            <tr>
                <th class="text-start p-0 px-1 w-100 border-secondary text-stat">
                    <i class="fa-solid me-1 fa-file-word"></i> Unique Words
                </th>
                <td class="text-start p-0 px-1 w-100 border-secondary text-truncate">{{ userData.UniqueWords }}</td>
            </tr>
            <tr>
                <th class="text-start p-0 px-1 w-100 border-secondary text-stat">
                    <i class="fa-solid me-1 fa-hourglass"></i> Message Interval
                </th>
                <td class="text-start p-0 px-1 w-100 border-secondary text-truncate">{{ formatMessageInterval(userData.MessageIntervalMs) }}</td>
            </tr>
            <tr>
                <th class="text-start p-0 px-1 w-100 border-secondary text-stat">
                    <i class="fa-solid me-1 fa-link"></i> Links Shared
                </th>
                <td class="text-start p-0 px-1 w-100 border-secondary text-truncate">{{ userData.LinksShared }}</td>
            </tr>
            <tr>
                <th class="text-start p-0 px-1 w-100 border-secondary text-stat">
                    <i class="fa-solid me-1 fa-users-between-lines"></i> Total Raiders
                </th>
                <td class="text-start p-0 px-1 w-100 border-secondary text-truncate">{{ userData.RaidStatistic?.totalRaids }}</td>
            </tr>
            <tr>
                <th class="text-start p-0 px-1 w-100 border-secondary text-stat">
                    <i class="fa-solid me-1 fa-user-plus"></i> Total New Chatters
                </th>
                <td class="text-start p-0 px-1 w-100 border-secondary text-truncate">{{ userData.FirstTimeChatter }}</td>
            </tr>
            <tr>
                <th class="text-start p-0 px-1 w-100 border-secondary text-stat">
                    <i class="fa-solid me-1 fa-ban"></i> Total Timeouts
                </th>
                <td class="text-start p-0 px-1 w-100 border-secondary text-truncate">{{ userData.TotalTimeouts.totalTimeouts }}</td>
            </tr>
            <tr>
                <th class="text-start p-0 px-1 w-100 border-secondary text-stat">
                    <i class="fa-solid me-1 fa-trash"></i> Total Deleted Messages
                </th>
                <td class="text-start p-0 px-1 w-100 border-secondary text-truncate">{{ userData.TotalDeletedMessages }}</td>
            </tr>
            <tr>
                <th class="text-start p-0 px-1 w-100 border-secondary text-stat">
                    <i class="fa-solid me-1 fa-hourglass"></i> Average Timeout Duration
                </th>
                <td class="text-start p-0 px-1 w-100 border-secondary text-truncate">{{ userData.TotalTimeouts.averageTimeoutDuration / 60 | number: '1.0-0' }} min</td>
            </tr>
            <tr>
                <th class="text-start p-0 px-1 w-100 border-secondary text-stat">
                    <i class="fa-solid me-1 fa-gavel"></i> Total Bans
                </th>
                <td class="text-start p-0 px-1 w-100 border-secondary text-truncate">{{ userData.TotalBans.totalBans }}</td>
            </tr>
        </tbody>
    </table>
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

      .text-stat {
        color: rgba(241, 187, 104, 0.85);
      }
    `,
  ],
})
export class ChannelInfoComponent implements OnInit, OnDestroy {
  userData!: UserData;
  private subscriptions = new Subscription();
  
  // Cache for formatted intervals to avoid repeated calculations
  private intervalCache = new Map<number, string>();

  constructor(public dataService: DataService) {}

  ngOnInit(): void {
    // Move subscription to ngOnInit instead of constructor
    this.subscriptions.add(
      this.dataService.userData$.subscribe((userData) => {
        this.userData = userData;
        // Clear cache when userData changes
        this.intervalCache.clear();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.intervalCache.clear(); // Clean up cache
  }

  activeChatterPercentage(): number {
    if (!this.userData?.UniqueChatters || !this.userData?.ChannelMetrics?.viewerStatistics?.peakViewers) {
      return 0;
    }
    
    const peakViewers = this.userData.ChannelMetrics.viewerStatistics.peakViewers;
    if (peakViewers === 0) {
      return 0; // Prevent division by zero
    }
    
    return Math.round((this.userData.UniqueChatters / peakViewers) * 100);
  }

  formatMessageInterval(intervalMs: number): string {
    // Use cache to avoid repeated calculations
    if (this.intervalCache.has(intervalMs)) {
      return this.intervalCache.get(intervalMs)!;
    }

    let result: string;
    
    if (intervalMs < 1000) {
      result = `${intervalMs.toFixed(2)} ms`;
    } else if (intervalMs < 60000) {
      result = `${(intervalMs / 1000).toFixed(2)} s`;
    } else if (intervalMs < 3600000) {
      result = `${(intervalMs / 60000).toFixed(2)} min`;
    } else {
      result = `${(intervalMs / 3600000).toFixed(2)} h`;
    }

    this.intervalCache.set(intervalMs, result);
    return result;
  }

  formatAverage(average: number): string {
    // Add null/undefined check and use integer check
    if (average == null || !Number.isFinite(average)) {
      return '0';
    }
    return Math.round(average).toLocaleString();
  }

  formatDate(dateString: string): string {
    // Add null/undefined check
    if (!dateString) {
      return '';
    }
    
    if (!dateString.includes('.')) {
      return dateString;
    }
    
    const parts = dateString.split('.');
    return parts.length === 3 ? `${parts[0]}d ${parts[1]}` : parts[0];
  }

  // Optional: Add method to manually clear cache if needed
  clearCache(): void {
    this.intervalCache.clear();
  }
}
