import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { SentimentOverTime } from '../../models/sentiment.model';
import { CommonModule } from '@angular/common';
import { ChartType, GoogleChartsModule } from 'angular-google-charts';

@Component({
  selector: 'app-sentiment-over-time',
  standalone: true,
  template: `
    <div class="card border-secondary bg-dark text-light text-center">
      <h5>Sentiment Over Time (UTC)</h5>

      <!-- Google Line Chart -->
      <google-chart
        *ngIf="chartData.length > 0"
        style="width: 100%;"
        [type]="chartType"
        [data]="chartData"
        [columns]="chartColumns"
        [options]="chartOptions"
      >
      </google-chart>
    </div>
  `,
  styles: [
    `
      .card {
        border: 1px solid #ccc;
        padding: 1rem;
        margin: 0.5rem 0;
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
  imports: [CommonModule, GoogleChartsModule],
})
export class SentimentOverTimeComponent implements OnInit, OnChanges {
  @Input() data: SentimentOverTime[] = [];
  @Input() redrawTrigger: boolean = false;

  chartType: ChartType = ChartType.AreaChart;
  chartColumns: string[] = [
    'Time',
    'Positive',
    'Negative',
    'Neutral',
    'Compound',
  ];
  chartData: any[] = [];
  chartOptions = {
    backgroundColor: '#212529',
    colors: ['#1b9e77', '#d95f02', '#7570b3', '#e7298a'],
    legend: { textStyle: { color: 'white' }, position: 'none' },
    hAxis: { textStyle: { color: 'white', fontSize: 10 } },
    vAxis: {
      textStyle: { color: 'white' },
      viewWindowMode: 'explicit',
      viewWindow: {
        max: 100,
        min: 0,
      },
    },
    tooltip: { textStyle: { color: 'black' }, showColorCode: true },
    height: 400,
    chartArea: { left: '5%', width: '93%', height: '75%' },
    animation: {
      startup: true,
      duration: 1000,
      easing: 'out',
    },
  };

  ngOnInit(): void {
    this.updateChartData();
  }

  ngOnChanges(): void {
    this.updateChartData();
  }

  updateChartData(): void {
    // Pre sort the data by time
    this.data = this.data.sort(
      (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
    );

    // Initialize chart data with columns
    this.chartData = this.data.map((entry) => [
      this.formatTime(entry.time),
      entry.averagePositive * 100,
      entry.averageNegative * 100,
      entry.averageNeutral * 100,
      entry.averageCompound,
    ]);
  }

  formatTime(time: string): string {
    var date = new Date(time);
    var hours = date.getUTCHours().toString().padStart(2, '0');
    var minutes = date.getUTCMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }
}
