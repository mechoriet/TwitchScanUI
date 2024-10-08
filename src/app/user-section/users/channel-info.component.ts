import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserData } from '../../models/user.model';
import { getTimeSince } from '../../helper/date.helper';

@Component({
    selector: 'app-channel-info',
    standalone: true,
    template: `
    <div class="card bg-glass border-secondary border-0 border-bottom border-end border-start text-light shadow-none rounded-0 rounded-bottom mt-3 px-2">
      <table class="table table-dark bg-glass table-borderless text-light">
        <thead>
          <tr>
            <th class="bg-glass">Category</th>
            <th class="bg-glass">Uptime</th>
            <th class="bg-glass">Current</th>
            <th class="bg-glass">Average</th>
            <th class="bg-glass">Peak</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="bg-glass">{{ userData.ChannelMetrics.currentGame }}</td>
            <td class="bg-glass">{{ formatDate(userData.ChannelMetrics.uptime) }}</td>
            <td class="bg-glass"><span class="badge bg-primary">{{ userData.ChannelMetrics.viewerStatistics.currentViewers }}</span></td>
            <td class="bg-glass"><span class="badge bg-success">{{ formatAverageViewers(userData.ChannelMetrics.viewerStatistics.averageViewers) }}</span></td>
            <td class="bg-glass"><span class="badge bg-danger">{{ userData.ChannelMetrics.viewerStatistics.peakViewers }}</span></td>
          </tr>
        </tbody>
      </table>
        <!-- Messages -->
        <div class="card col-12 border-secondary bg-glass text-light rounded-0 rounded-bottom border-0 border-top mb-2">
            <p class="mt-2 message-info"><strong class="text-warning">Messages:</strong> {{ userData.TotalMessages }}</p>
            <p class="mb-2 message-info">
              <strong class="text-warning">Average Length:</strong>
              {{ userData.AverageMessageLength.toFixed(2) }} characters
            </p>
        </div>  
    </div>
  `,
    imports: [CommonModule],
    styles: [
        `
      .message-info {
        display: flex;
        flex-direction: row;
        justify-content: space-evenly;
      }
    `,
    ],
})
export class ChannelInfoComponent {
    @Input({ required: true }) userData!: UserData;

    formatAverageViewers(averageViewers: number): string {
        return Math.round(averageViewers).toLocaleString();
    }

    formatDate(dateString: string): string {
        return dateString.includes('.') ? dateString.split('.')[0] : dateString;
    }
}
