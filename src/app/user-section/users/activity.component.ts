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
  selector: 'app-peak-activity-periods',
  standalone: true,
  template: `
    <div class="card border-secondary bg-dark text-light h-100 text-center m-0 px-2" *ngIf="chartData.datasets[0].data.length > 0; else noData">
          <h5>Messages over time (UTC)
          <i
            class="fa-solid"
            [ngClass]="{
              'trend-stable fa-minus':
                userData.PeakActivityPeriods.trend === Trend.Stable,
              'trend-up fa-arrow-up':
                userData.PeakActivityPeriods.trend === Trend.Increasing,
              'trend-down fa-arrow-down':
                userData.PeakActivityPeriods.trend === Trend.Decreasing
            }"
          ></i></h5>
          <canvas (dblclick)="resetZoom()"    
          class="no-drag px-2"               
            baseChart
            [data]="chartData"
            [options]="chartOptions"
            [type]="'line'"
          >
          </canvas>
    </div>

    <ng-template #noData>
      <div class="card border-secondary bg-dark text-light text-center h-100 m-0 justify-content-center">
        <h5>No Message Data Available</h5>
      </div>
    </ng-template>
  `,
  imports: [CommonModule, BaseChartDirective],
})
export class MessagesOverTimeComponent implements OnDestroy {
  @ViewChild(BaseChartDirective) chart!: BaseChartDirective;
  userData!: UserData;
  username!: string;
  subscriptions: Subscription = new Subscription();

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
        label: 'Messages',
        data: [],
        fill: true,
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        tension: 0.3,
        pointRadius: 0,
        pointHitRadius: 10,
      },
      {
        label: 'Sub Only Messages',
        data: [],
        fill: true,
        backgroundColor: 'rgba(255, 159, 64, 0.2)',
        borderColor: 'rgba(255, 159, 64, 1)',
        tension: 0.3,
        pointRadius: 0,
        pointHitRadius: 10,
      },
      {
        label: 'Emote Only Messages',
        data: [],
        fill: true,
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        borderColor: 'rgba(153, 102, 255, 1)',
        tension: 0.3,
        pointRadius: 0,
        pointHitRadius: 10,
      },
      {
        label: 'Slow Mode Messages',
        data: [],
        fill: true,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        tension: 0.3,
        pointRadius: 0,
        pointHitRadius: 10,
      },
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
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
      y: {
        ticks: {
          color: 'white',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        beginAtZero: true,
        min: 0,
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
    const peakActivity = this.userData.PeakActivityPeriods;

    // Collect all unique timestamps from all datasets
    const allTimestamps = new Set<string>([
      ...Object.keys(peakActivity.messagesOverTime),
      ...Object.keys(peakActivity.subOnlyMessagesOverTime),
      ...Object.keys(peakActivity.emoteOnlyMessagesOverTime),
      ...Object.keys(peakActivity.slowModeMessagesOverTime),
    ]);

    // Sort the timestamps only once
    const sortedTimestamps = Array.from(allTimestamps).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    // Predefine data arrays
    const messagesData: number[] = [];
    const subOnlyData: number[] = [];
    const emoteOnlyData: number[] = [];
    const slowModeData: number[] = [];
    const labels: string[] = [];

    // Populate the data arrays in a single loop
    for (const time of sortedTimestamps) {
      const timestamp = new Date(time);
      labels.push(this.dataInterpolationService.formatTime(timestamp));

      messagesData.push(peakActivity.messagesOverTime[time] || 0);
      subOnlyData.push(peakActivity.subOnlyMessagesOverTime[time] || 0);
      emoteOnlyData.push(peakActivity.emoteOnlyMessagesOverTime[time] || 0);
      slowModeData.push(peakActivity.slowModeMessagesOverTime[time] || 0);
    }

    // Update datasets and hidden status in one loop
    const datasets = [
      { data: messagesData, index: 0 },
      { data: subOnlyData, index: 1 },
      { data: emoteOnlyData, index: 2 },
      { data: slowModeData, index: 3 },
    ];

    let hasAnyData = false;

    datasets.forEach(({ data, index }) => {
      const hasData = data.some(val => val > 0);
      this.chartData.datasets[index].hidden = !hasData;
      this.chartData.datasets[index].data = data;
      if (hasData) {
        hasAnyData = true;
      }
    });

    // Update labels and chart only if there's data
    this.chartData.labels = labels;

    if (hasAnyData) {
      this.chart?.chart?.update();
    }
  }

  formatAverageViewers(averageViewers: number): string {
    return Math.round(averageViewers).toLocaleString();
  }
}
