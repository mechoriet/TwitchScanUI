import { Component, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { DataInterpolationService } from '../../services/chart-service/data-interpolation.service';

@Component({
  selector: 'app-subscriptions-over-time',
  standalone: true,
  template: `
    <div class="card border-secondary bg-dark text-light text-center">
      <h5>Subscriptions Over Time (UTC)</h5>

      <!-- Line Chart for Subscriptions Over Time -->
      <canvas (dblclick)="resetZoom()"
        *ngIf="chartData.datasets[0].data.length > 0; else noData"
        baseChart
        [data]="chartData"
        [options]="chartOptions"
        [type]="'line'"
      >
      </canvas>

      <ng-template #noData>
        <p class="m-0" style="line-height: 400px;">No subscriptions yet.</p>
      </ng-template>
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
export class SubscriptionsOverTimeComponent implements OnInit, OnChanges {
  @ViewChild(BaseChartDirective) chart!: BaseChartDirective;
  @Input({ required: true }) subscriptions!: { key: string; value: number }[];
  @Input() redrawTrigger: boolean = false;

  constructor(private interpolationService: DataInterpolationService) { }

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
    if (!this.subscriptions || this.subscriptions.length === 0) return;

    // Prepare the data for interpolation
    const rawData = this.subscriptions.map(sub => ({
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
