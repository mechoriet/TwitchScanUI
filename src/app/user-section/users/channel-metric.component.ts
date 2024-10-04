import { Component, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { ChannelMetrics } from '../../models/user.model';
import { DataInterpolationService } from '../../services/chart-service/data-interpolation.service';

@Component({
  selector: 'app-channel-metrics',
  standalone: true,
  template: `
    <div>
      <div class="card border-secondary bg-dark text-light chart-container text-center">
        <h5>Viewers Over Time (UTC)</h5>
        <canvas (dblclick)="resetZoom()"
          *ngIf="chartData.datasets[0].data.length > 0"
          baseChart
          [data]="chartData"
          [options]="chartOptions"
          [type]="'line'"
        ></canvas>
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
  imports: [CommonModule, BaseChartDirective],
})
export class ChannelMetricsComponent implements OnInit, OnChanges {
  @ViewChild(BaseChartDirective) chart!: BaseChartDirective;
  @Input({ required: true }) metrics!: ChannelMetrics;

  constructor(private interpolationService: DataInterpolationService) {}

  // Chart Data Structure
  chartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        label: 'Viewers',
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
    if (!this.metrics || !this.metrics.viewersOverTime) return;

    // Prepare raw data for interpolation
    const rawData = Object.keys(this.metrics.viewersOverTime).map((time) => ({
      time,
      value: this.metrics.viewersOverTime[time],
    }));

    // Use the interpolation service to fill in missing intervals
    const interpolatedData = this.interpolationService.interpolateData(rawData, 60 * 1000); // 1-minute interval

    // Update chart data with interpolated results
    this.chartData.labels = interpolatedData.map((entry) => this.interpolationService.formatTime(entry.time));
    this.chartData.datasets[0].data = interpolatedData.map((entry) => entry.value);

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
