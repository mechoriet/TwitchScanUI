import { Component, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { DataInterpolationService } from '../../services/chart-service/data-interpolation.service';
import zoomPlugin from 'chartjs-plugin-zoom';
import { Trend, UserData } from '../../models/user.model';
import { DataService } from '../../services/app-service/data.service';
import { Subscription } from 'rxjs';
import { SettingsService } from '../../services/app-service/settings.service';
Chart.register(zoomPlugin);

@Component({
  selector: 'app-sentiment-over-time',
  standalone: true,
  template: `
    <div class="card border-secondary bg-dark text-light text-center m-0 px-2" *ngIf="chartData.datasets[0].data.length > 0; else noData">
      <h5>Sentiment Over Time (UTC)
          <i
            class="fa-solid"
            [ngClass]="{
              'trend-stable fa-minus':
                userData.SentimentAnalysis.trend === Trend.Stable,
              'trend-up fa-arrow-up':
                userData.SentimentAnalysis.trend === Trend.Increasing,
              'trend-down fa-arrow-down':
                userData.SentimentAnalysis.trend === Trend.Decreasing
            }"
          ></i></h5>

      <!-- Line Chart for Sentiment Over Time -->
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
      <div class="card border-secondary bg-dark text-light text-center m-0 justify-content-center">
        <h5>No Sentiment Data Available</h5>
      </div>
    </ng-template>
  `,
  styles: [
    `
      .card {
        height: 100% !important;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 1rem;
      }
      th,
      td {
        border: 1px solid #ddd;
        padding: 0.5rem;
        text-align: center;
      }
      th {
        background-color: #495057;
        color: white;
      }
    `,
  ],
  imports: [CommonModule, BaseChartDirective],
})
export class SentimentOverTimeComponent implements OnDestroy {
  @ViewChild(BaseChartDirective) chart!: BaseChartDirective;
  userData!: UserData;
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
        label: 'Positive (%)',
        data: [],
        borderColor: '#1b9e77',
        backgroundColor: 'rgba(27, 158, 119, 0.2)',
        fill: true,
        tension: 0.3,
        pointRadius: 0,
        pointHitRadius: 10,
      },
      {
        label: 'Negative (%)',
        data: [],
        borderColor: '#d95f02',
        backgroundColor: 'rgba(217, 95, 2, 0.2)',
        fill: true,
        tension: 0.3,
        pointRadius: 0,
        pointHitRadius: 10,
      },
      {
        label: 'Neutral (%)',
        data: [],
        borderColor: '#7570b3',
        backgroundColor: 'rgba(117, 112, 179, 0.2)',
        fill: true,
        tension: 0.3,
        pointRadius: 0,
        pointHitRadius: 10,
        hidden: true,
      },
      {
        label: 'Compound',
        data: [],
        borderColor: '#e7298a',
        backgroundColor: 'rgba(231, 41, 138, 0.2)',
        fill: true,
        tension: 0.3,
        pointRadius: 0,
        pointHitRadius: 10,
        hidden: true,
      },
    ],
  };

  // Chart Options
  chartOptions: ChartConfiguration<'line'>['options'] = {
    aspectRatio: 4,
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
      },
    },
    animation: false
  };

  resetZoom(): void {
    this.chart?.chart?.resetZoom();
  }

  async updateChartData(): Promise<void> {
    const data = this.userData?.SentimentAnalysis?.sentimentOverTime;
    if (!data || data.length === 0) {
      this.chartData.datasets[0].data = [];
      return;
    }

    // Prepare raw data for interpolation
    const rawData = data.map((entry) => ({
      time: entry.time,
      value: entry.averageCompound,
    }));

    // Set the labels (time) and dataset values for the chart based data
    this.chartData.labels = rawData.map((entry) =>
      this.interpolationService.formatTime(new Date(entry.time))
    );

    // Populate each dataset with corresponding values
    this.chartData.datasets[0].data = rawData.map(
      (_, index) => data[index]?.averagePositive * 100 || 0
    );
    this.chartData.datasets[1].data = rawData.map(
      (_, index) => data[index]?.averageNegative * 100 || 0
    );
    this.chartData.datasets[2].data = rawData.map(
      (_, index) => data[index]?.averageNeutral * 100 || 0
    );
    this.chartData.datasets[3].data = rawData.map(
      (_, index) => data[index]?.averageCompound * 100 || 0
    );

    // Update the chart
    this.chart?.chart?.update();
  }

  formatTime(time: string): string {
    const date = new Date(time);
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }
}
