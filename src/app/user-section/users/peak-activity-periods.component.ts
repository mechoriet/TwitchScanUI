import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartType, GoogleChartsModule } from 'angular-google-charts';
import { ThumbnailComponent } from './thumbnail.component';

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
        <i class="fa-solid fa-clock me-2"></i> Activity Periods
      </h4>
      <div id="peakActivityCollapse" class="collapse show">
        <div class="card border-secondary bg-dark text-light text-center">
          <!-- Google Line Chart for Peak Activity Periods -->
          <h5>Messages over time (UTC)</h5>
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
      div[google-chart] {
        width: 100%;
        height: 400px;
      }
    `,
  ],
  imports: [CommonModule, GoogleChartsModule, ThumbnailComponent],
})
export class PeakActivityPeriodsComponent implements OnInit, OnChanges {
  @Input() peakActivityPeriods: { [key: string]: number } = {};
  @Input({ required: true }) username: string = '';

  chartType: ChartType = ChartType.AreaChart;
  chartColumns: string[] = ['Period', 'Messages'];
  chartData: any[] = [];
  chartOptions = {
    backgroundColor: '#212529',
    colors: ['#1b9e77'],
    legend: { textStyle: { color: 'white' }, position: 'none' },
    hAxis: {
      textStyle: { color: 'white', fontSize: 10 },
    },
    vAxis: {
      textStyle: { color: 'white' },
      viewWindowMode: 'explicit',
      viewWindow: {
        min: 0,
      },
    },
    chartArea: { left: '5%', width: '93%', height: '75%' },
    height: 400,
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
    this.peakActivityPeriods = Object.keys(this.peakActivityPeriods)
      .sort()
      .reduce((obj, key) => {
        obj[key] = this.peakActivityPeriods[key];
        return obj;
      }, {} as { [key: string]: number });

    // Convert PeakActivityPeriods object to chart data format
    this.chartData = Object.entries(this.peakActivityPeriods).map(
      ([period, activity]) => [this.formatTime(period), activity]
    );
  }

  formatTime(time: string): string {
    var date = new Date(time);
    var hours = date.getHours().toString().padStart(2, '0');
    var minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }
}
