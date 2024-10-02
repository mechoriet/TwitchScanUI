import { Component, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import { SentimentOverTime } from '../../models/sentiment.model';
import { CommonModule } from '@angular/common';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { DataInterpolationService } from '../../services/chart-service/data-interpolation.service';

@Component({
  selector: 'app-sentiment-over-time',
  standalone: true,
  template: `
    <div class="card border-secondary bg-dark text-light text-center">
      <h5>Sentiment Over Time (UTC)</h5>

      <!-- Line Chart for Sentiment Over Time -->
      <canvas
        *ngIf="chartData.datasets[0].data.length > 0"
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
})
export class SentimentOverTimeComponent implements OnInit, OnChanges {
  @ViewChild(BaseChartDirective) chart!: BaseChartDirective;
  @Input() data: SentimentOverTime[] = [];
  @Input() redrawTrigger: boolean = false;
  
  constructor(private interpolationService: DataInterpolationService) {}

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
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: 'white' },
      },
      tooltip: {
        enabled: true,
      },
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

  updateChartData(): void {
    if (!this.data || this.data.length === 0) return;

    // Sort the input data by time
    const sortedData = this.data.sort(
      (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
    );

    // Prepare raw data for interpolation
    const rawData = sortedData.map((entry) => ({
      time: entry.time,
      value: entry.averageCompound,
    }));

    // Use the interpolation service to fill missing time intervals
    const interpolatedData = this.interpolationService.interpolateData(rawData, 60 * 1000); // 1-minute interval

    // Set the labels (time) and dataset values for the chart based on the interpolated data
    this.chartData.labels = interpolatedData.map((entry) =>
      this.interpolationService.formatTime(entry.time)
    );
    
    // Populate each dataset with corresponding interpolated values
    this.chartData.datasets[0].data = interpolatedData.map(
      (entry, index) => sortedData[index]?.averagePositive * 100 || 0
    );
    this.chartData.datasets[1].data = interpolatedData.map(
      (entry, index) => sortedData[index]?.averageNegative * 100 || 0
    );
    this.chartData.datasets[2].data = interpolatedData.map(
      (entry, index) => sortedData[index]?.averageNeutral * 100 || 0
    );
    this.chartData.datasets[3].data = interpolatedData.map((entry) => entry.value);

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
