import { Component, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import { SentimentOverTime } from '../../models/sentiment.model';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { DataInterpolationService } from '../../services/chart-service/data-interpolation.service';
import zoomPlugin from 'chartjs-plugin-zoom';
import { fadeInOut } from '../../user-dashboard/user-dashboard.animations';
Chart.register(zoomPlugin);

@Component({
  selector: 'app-sentiment-over-time',
  standalone: true,
  template: `
    <div class="card border-secondary bg-dark text-light text-center" *ngIf="chartData.datasets[0].data.length > 0" @fadeInOut>
      <h5>Sentiment Over Time (UTC)</h5>

      <!-- Line Chart for Sentiment Over Time -->
      <canvas (dblclick)="resetZoom()"        
        baseChart
        [data]="chartData"
        [options]="chartOptions"
        [type]="'line'"
      >
      </canvas>
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
  animations: [
    fadeInOut
  ]
})
export class SentimentOverTimeComponent implements OnInit, OnChanges {
  @ViewChild(BaseChartDirective) chart!: BaseChartDirective;
  @Input() data: SentimentOverTime[] = [];
  @Input() redrawTrigger: boolean = false;

  constructor(private interpolationService: DataInterpolationService) { }

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
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart',
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
    if (!this.data || this.data.length === 0) return;

    // Sort the input data by time
    const data = this.data;

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
