import { Component, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { ThumbnailComponent } from './thumbnail.component';
import { ChannelMetrics, UserData } from '../../models/user.model';
import { ChannelMetricsComponent } from './channel-metric.component';
import { DataInterpolationService } from '../../services/chart-service/data-interpolation.service';

@Component({
  selector: 'app-peak-activity-periods',
  standalone: true,
  template: `
    <div class="card border-secondary bg-dark text-light">
      <h4 (click)="updateChartData()"
        class="pointer"
        data-bs-toggle="collapse"
        data-bs-target="#peakActivityCollapse"
        aria-expanded="true"
        aria-controls="peakActivityCollapse">
        <i class="fa-solid fa-clock me-2 text-warning"></i> Activity
      </h4>
      <div id="peakActivityCollapse" class="collapse show">        
        <!-- Chart -->
        <div class="card border-secondary bg-dark text-light text-center">
          <h5>Messages over time (UTC)</h5>
          <canvas (dblclick)="resetZoom()"
            *ngIf="chartData.datasets[0].data.length > 0; else noData"
            baseChart
            [data]="chartData"
            [options]="chartOptions"
            [type]="'line'"
          >
          </canvas>
          <ng-template #noData>
            <p class="m-0" style="line-height: 400px;">No messages yet.</p>
          </ng-template>
        </div> 
        <!-- Messages -->
        <div class="card col-12 border-secondary bg-dark text-light text-center mb-3">
            <p><strong class="text-warning">Messages:</strong> {{ userData.TotalMessages }}</p>
            <p>
              <strong class="text-warning">Average Length:</strong>
              {{ userData.AverageMessageLength.toFixed(2) }} characters
            </p>
        </div>  
        <!-- Channel Info -->
        <div class="card border-secondary bg-dark text-light p-3">
          <table class="table table-dark table-borderless text-light">
            <thead>
              <tr>
                <th>Category</th>
                <th>Uptime</th>
                <th>Current</th>
                <th>Average</th>
                <th>Peak</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{{ userData.ChannelMetrics.currentGame }}</td>
                <td>{{ formatUptime(userData.ChannelMetrics.uptime) }}</td>
                <td><span class="badge bg-primary">{{ userData.ChannelMetrics.viewerStatistics.currentViewers }}</span></td>
                <td><span class="badge bg-success">{{ formatAverageViewers(userData.ChannelMetrics.viewerStatistics.averageViewers) }}</span></td>
                <td><span class="badge bg-danger">{{ userData.ChannelMetrics.viewerStatistics.peakViewers }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
        <!-- Channel Metrics -->
        <app-channel-metrics [metrics]="userData.ChannelMetrics"></app-channel-metrics>
        <!-- Thumbnail -->
        <app-thumbnail [username]="username"></app-thumbnail>  
      </div>
    </div>
  `,
  styles: [
    `
      .card {
        border: 1px solid #ccc;
        padding: 1rem;
        margin: 0.5rem 0;
      }
      canvas {
        width: 100% !important;
        height: 400px !important;
      }
      .pointer {
        cursor: pointer;
      }
    `,
  ],
  imports: [CommonModule, BaseChartDirective, ThumbnailComponent, ChannelMetricsComponent],
})
export class PeakActivityPeriodsComponent implements OnInit, OnChanges {
  @ViewChild(BaseChartDirective) chart!: BaseChartDirective;
  @Input({ required: true }) userData!: UserData;
  @Input({ required: true }) username: string = '';

  // Inject the DataInterpolationService
  constructor(private dataInterpolationService: DataInterpolationService) { }

  // Chart Data Structure
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
    ],
  };

  // Chart Options
  chartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: 'white' },
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
  };

  ngOnInit(): void {
    this.updateChartData();
  }

  ngOnChanges(): void {
    this.updateChartData();
  }

  resetZoom(): void {
    this.chart?.chart?.resetZoom();
  }

  updateChartData(): void {
    // Prepare the data for interpolation
    const rawData = Object.keys(this.userData.PeakActivityPeriods).map(time => ({
      time,
      value: this.userData.PeakActivityPeriods[time],
    }));

    // Interpolate the data (e.g., with a 1-minute interval)
    const intervalMs = 60 * 1000; // 1 minute
    const interpolatedData = this.dataInterpolationService.interpolateData(rawData, intervalMs);

    // Convert interpolated data to chart format
    this.chartData.labels = interpolatedData.map(entry => this.dataInterpolationService.formatTime(entry.time));
    this.chartData.datasets[0].data = interpolatedData.map(entry => entry.value);

    this.chart?.chart?.update();
  }

  formatUptime(uptime: string): string {
    const [hours, minutes, seconds] = uptime.split(':');
    const cleanSeconds = seconds.split('.')[0];
    return `${hours}:${minutes}:${cleanSeconds}`;
  }

  formatAverageViewers(averageViewers: number): string {
    return Math.round(averageViewers).toLocaleString();
  }
}
