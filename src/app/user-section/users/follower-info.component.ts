import { Component, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { Trend, UserData } from '../../models/user.model';
import { DataInterpolationService } from '../../services/chart-service/data-interpolation.service';
import { getTimeSince } from '../../helper/date.helper';
import { DataService } from '../../services/app-service/data.service';
import { Subscription } from 'rxjs';
import { SettingsService } from '../../services/app-service/settings.service';

@Component({
  selector: 'app-follower-info',
  standalone: true,
  template: `
    <div class="h-100 text-center m-0" *ngIf="chartData.datasets[0].data.length > 0; else noData">
    <p class="position-absolute end-0 pe-3">
      {{ +gained > 0 ? '+' + gained : gained }}
    </p>
          
          <canvas (dblclick)="resetZoom()"    
          class="no-drag px-1"               
            baseChart
            [data]="chartData"
            [options]="chartOptions"
            [type]="'line'"
          >
          </canvas>
    </div>

    <ng-template #noData>
      <div class="card border-secondary bg-dark text-light text-center h-100 m-0 justify-content-center">
        <h5>No Follower Data Available</h5>
      </div>
    </ng-template>
  `,
  imports: [CommonModule, BaseChartDirective],
})
export class FollowerInfoComponent implements OnDestroy {
  @ViewChild(BaseChartDirective) chart!: BaseChartDirective;
  userData!: UserData;
  username!: string;
  subscriptions: Subscription = new Subscription();

  gained: string = "";

  constructor(private dataInterpolationService: DataInterpolationService, public dataService: DataService, private settingsService: SettingsService) {
    this.userData = dataService.getUserData();
    this.subscriptions.add(this.dataService.userData$.subscribe((userData) => {
      this.userData = userData;
      this.updateChartData();
    }));

    this.subscriptions.add(this.settingsService.settings$.subscribe((s) => {
      if (this.chartOptions) {
        // Update the animation setting
        this.chartOptions.animation = s.showChartAnimations;
    
        // Force Chart.js to re-render the chart with the new options
        if (this.chart && this.chart.chart) {
          this.chart.chart.config.options = this.chartOptions;
          this.chart.chart.update();
        }
      }
    }));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  getTimeSince = getTimeSince;
  Trend = Trend;

  chartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        label: 'Followers',
        data: [],
        fill: true,
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        tension: 0.3,
        pointRadius: 0,
        pointHitRadius: 10,
      }
    ],
  };

  chartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: 'white', font: { size: 10 } },
      },
      tooltip: {
        enabled: true,
      },
      zoom: {
        pan: {
          enabled: true
        },
        zoom: {
          wheel: {
            enabled: true,
          },
          pinch: {
            enabled: true
          },
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: 'white',
          font: { size: 10 },
          maxTicksLimit: 10, // reduce number of visible labels
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
      y: {
        ticks: {
          color: 'white',
          stepSize: 1,
          precision: 0,
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
    },
    elements: {
      line: {
        borderWidth: 2,
      },
    },
    animation: false
  };

  resetZoom(): void {
    this.chart?.chart?.resetZoom();
  }

  updateChartData(): void {
    const followers = this.userData.FollowMetrics as { [timestamp: string]: number };

    // Early return if no data
    if (!followers || Object.keys(followers).length === 0) {
      this.chartData.labels = [];
      this.chartData.datasets[0].data = [];
      this.chartData.datasets[0].hidden = true;
      this.chart?.chart?.update();
      return;
    }
  
    // Get timestamps
    const timestamps = Object.keys(followers).sort();

    // Get the first and last follower counts
    const firstCount = followers[timestamps[0]];
    const lastCount = followers[timestamps[timestamps.length - 1]];
    const gainedRaw = lastCount - firstCount;
    // Set the gained value
    if (gainedRaw < 1000) {
        this.gained = gainedRaw.toString(); // e.g., "534"
      } else {
        this.gained = ((gainedRaw / 1000).toFixed(3)) + 'k'; // e.g., "3.000k"
      }
    // Populate data arrays
    const labels: string[] = [];
    const followersData: number[] = [];
    
    for (const timestamp of timestamps) {
      const date = new Date(timestamp);
      labels.push(this.dataInterpolationService.formatTime(date));
      followersData.push(followers[timestamp] || 0);
    }
  
    // Check if we have meaningful data
    const hasData = followersData.some(val => val > 0);
  
    // Update chart data
    this.chartData.labels = labels;
    this.chartData.datasets[0].data = followersData;
    this.chartData.datasets[0].hidden = !hasData;
  
    // Update chart if we have data
    if (hasData) {
      this.chart?.chart?.update();
    }
  }

  formatAverageViewers(averageViewers: number): string {
    return Math.round(averageViewers).toLocaleString();
  }
}
