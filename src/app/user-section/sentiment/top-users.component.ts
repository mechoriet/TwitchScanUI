import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { SentimentUser } from '../../models/sentiment.model';
import { CommonModule } from '@angular/common';
import { ChartType, GoogleChartsModule } from 'angular-google-charts';

@Component({
  selector: 'app-top-users',
  standalone: true,
  template: `
    <div class="card border-secondary bg-dark text-light text-center">
      <h5>{{ title }}</h5>

      <!-- Google Chart -->
      <google-chart
        *ngIf="userChartData.length > 0"
        style="width: 100%;"
        [type]="chartType"
        [data]="userChartData"
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
      ul {
        list-style-type: none;
        padding: 0;
      }
      li {
        padding: 0.2rem 0;
      }
      div[google-chart] {
        width: 100%;
        height: 400px;
      }
    `,
  ],
  imports: [CommonModule, GoogleChartsModule],
})
export class TopUsersComponent implements OnInit, OnChanges {
  @Input() title: string = '';
  @Input() users: SentimentUser[] = [];
  @Input() positive: boolean = true;
  @Input() redrawTrigger: boolean = false;

  chartType = ChartType.BarChart;
  chartColumns = ['Username', `Sentiment (%)`];
  userChartData: any[] = [];
  chartOptions = {
    backgroundColor: '#212529',
    legend: { textStyle: { color: 'white' }, position: 'none' },
    hAxis: { textStyle: { color: 'white' } },
    vAxis: { textStyle: { color: 'white' } },
    bars: 'vertical',
    height: 400,
    chartArea: { left: '15%', width: '82%', height: '85%' },
    colors: ['#4285F4'],
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
    // Populate chart data based on the users' average positive sentiment
    this.userChartData = this.users.map((user) => [
      user.username,
      user.averageCompound * 100,
    ]);
  }
}
