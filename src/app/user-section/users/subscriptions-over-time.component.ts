import { Component, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { DataInterpolationService } from '../../services/chart-service/data-interpolation.service';
import { Trend, UserData } from '../../models/user.model';
import { Subscription } from 'rxjs';
import { DataService } from '../../services/app-service/data.service';
import { SettingsService } from '../../services/app-service/settings.service';

@Component({
  selector: 'app-subscriptions-over-time',
  standalone: true,
  template: `
    <div class="card border-secondary bg-dark text-light text-center h-100 m-0 px-2" *ngIf="hasData(); else noSubs">
      <h5>
        Subscriptions Over Time (UTC)
        <i
          class="fa-solid"
          [ngClass]="{
            'trend-stable fa-minus': userData.SubscriptionStatistic.trend === Trend.Stable,
            'trend-up fa-arrow-up': userData.SubscriptionStatistic.trend === Trend.Increasing,
            'trend-down fa-arrow-down': userData.SubscriptionStatistic.trend === Trend.Decreasing
          }"
        ></i>
      </h5>

      <!-- Mixed Chart: Line for Subscriptions and Bar for Bits Cheered -->
      <canvas (dblclick)="resetZoom()" 
              class="no-drag px-2"       
              baseChart
              [data]="chartData"
              [options]="chartOptions"
              [type]="'bar'">
      </canvas>
    </div>

    <ng-template #noSubs>
      <div class="card border-secondary bg-dark text-light text-center h-100 m-0 justify-content-center">
        <h5>Not enough Subscription Data Available</h5>
      </div>
    </ng-template>
  `,
  imports: [CommonModule, BaseChartDirective],
})
export class SubscriptionsOverTimeComponent implements OnDestroy {
  @ViewChild(BaseChartDirective) chart!: BaseChartDirective;
  userData: UserData;
  subscriptions: Subscription = new Subscription();

  Trend = Trend;

  constructor(
    private interpolationService: DataInterpolationService,
    private dataService: DataService,
    private settingsService: SettingsService
  ) {
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

  // Helper to decide if there is any data to show
  hasData(): boolean {
    return (
      (this.chartData.datasets[0].data && (this.chartData.datasets[0].data as any[]).length > 1) ||
      (this.chartData.datasets[1].data && (this.chartData.datasets[1].data as any[]).length > 0)
    );
  }

  // Update the chartData to include two datasets:
  // - Subscriptions (as a line chart)
  // - Bits Cheered (as a bar chart)
  chartData: ChartConfiguration<any>['data'] = {
    labels: [],
    datasets: [
      {
        label: 'Subscriptions',
        type: 'line', // Explicitly set dataset type
        data: [],
        borderColor: '#1b9e77',
        backgroundColor: 'rgba(27, 158, 119, 0.2)',
        fill: true,
        tension: 0.3,
        pointRadius: 0,
        pointHitRadius: 10,
      },
      {
        label: 'Bits Cheered',
        type: 'bar',
        data: [],
        yAxisID: 'y1', // Use a different y-axis
        backgroundColor: 'rgba(208, 99, 255, 0.2)',
        borderColor: 'rgba(208, 99, 255, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Update chart options to include a second y-axis (y1) for the bits dataset
  chartOptions: ChartConfiguration<any>['options'] = {
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
        position: 'left',
        ticks: {
          color: 'white',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        beginAtZero: true,
        min: 0,
      },
      y1: {
        position: 'right',
        ticks: {
          color: 'white',
        },
        grid: {
          drawOnChartArea: false, // Prevents grid lines from y1 overlapping with the chart area
        },
        beginAtZero: true,
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
    // --- Process Subscriptions Data ---
    const subscriptions = this.userData?.SubscriptionStatistic?.subscriptionsOverTime;
    if (!subscriptions || subscriptions.length === 0) {
      this.chartData.datasets[0].data = [];
      // Optionally clear labels if no data exists
      // this.chartData.labels = [];
    } else {
      // Prepare and interpolate subscriptions data
      const rawData = subscriptions.map(sub => ({
        time: sub.key,
        value: sub.value,
      }));

      const interpolatedData = this.interpolationService.interpolateData(rawData, 60 * 1000); // 1-minute interval

      // Set labels based on the subscription timestamps
      this.chartData.labels = interpolatedData.map(entry =>
        this.interpolationService.formatTime(entry.time)
      );
      this.chartData.datasets[0].data = interpolatedData.map(entry => entry.value);
    }

    // --- Process Bits Cheered Data ---
    const bitsDataObj = this.userData?.PeakActivityPeriods.bitsOverTime;
    if (bitsDataObj) {
      // Convert the bits object into an array of { time, value } objects.
      const rawBitsData = Object.entries(bitsDataObj)
        .map(([key, value]) => ({ time: key, value }))
        .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

      // Interpolate the bits data similarly (if needed)
      const interpolatedBits = this.interpolationService.interpolateData(rawBitsData, 60 * 1000);

      // If for some reason there were no subscriptions to generate labels, use bits labels.
      if (!this.chartData.labels?.length && interpolatedBits.length) {
        this.chartData.labels = interpolatedBits.map(entry =>
          this.interpolationService.formatTime(entry.time)
        );
      }
      this.chartData.datasets[1].data = interpolatedBits.map(entry => entry.value);
    } else {
      this.chartData.datasets[1].data = [];
    }

    // Finally, update the chart
    this.chart?.chart?.update();
  }
}
