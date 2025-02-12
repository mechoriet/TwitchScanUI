import { Component, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { DataInterpolationService } from '../../services/chart-service/data-interpolation.service';
import { fadeInOut } from '../../animations/general.animations';
import { Trend, UserData } from '../../models/user.model';
import { Subscription } from 'rxjs';
import { DataService } from '../../services/app-service/data.service';
import { SettingsService } from '../../services/app-service/settings.service';

@Component({
  selector: 'app-subscriptions-over-time',
  standalone: true,
  template: `
    <div class="card border-secondary bg-dark text-light text-center h-100 m-0 px-2" *ngIf="chartData.datasets[0].data.length > 1; else noSubs">
      <h5>Subscriptions Over Time (UTC)
          <i
            class="fa-solid"
            [ngClass]="{
              'trend-stable fa-minus':
                userData.SubscriptionStatistic.trend === Trend.Stable,
              'trend-up fa-arrow-up':
                userData.SubscriptionStatistic.trend === Trend.Increasing,
              'trend-down fa-arrow-down':
                userData.SubscriptionStatistic.trend === Trend.Decreasing
            }"
          ></i></h5>

      <!-- Line Chart for Subscriptions Over Time -->
      <canvas (dblclick)="resetZoom()" 
        class="no-drag px-2"       
        baseChart
        [data]="chartData"
        [options]="chartOptions"
        [type]="'line'"
      >
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

  constructor(private interpolationService: DataInterpolationService, private dataService: DataService, private settingsService: SettingsService) {
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

  // Chart Data Structure
  chartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        label: 'Subscriptions',
        data: [],
        borderColor: '#1b9e77',
        backgroundColor: 'rgba(27, 158, 119, 0.2)',
        fill: true,
        tension: 0.3,
        pointRadius: 0,
        pointHitRadius: 10,
      },
    ],
  };

  // Chart Options
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
    const subscriptions = this.userData?.SubscriptionStatistic?.subscriptionsOverTime;
    if (!subscriptions || subscriptions.length === 0) {
      this.chartData.datasets[0].data = [];
      return;
    }

    // Prepare the data for interpolation
    const rawData = subscriptions.map(sub => ({
      time: sub.key,
      value: sub.value,
    }));

    // Use the interpolation service to fill in missing values
    const interpolatedData = this.interpolationService.interpolateData(rawData, 60 * 1000); // 1-minute interval

    // Map the complete data to chart labels and dataset
    this.chartData.labels = interpolatedData.map(entry =>
      this.interpolationService.formatTime(entry.time)
    );
    this.chartData.datasets[0].data = interpolatedData.map(entry => entry.value);

    // Update chart
    this.chart?.chart?.update();
  }
}
