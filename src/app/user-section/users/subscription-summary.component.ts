import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartType, GoogleChartsModule } from 'angular-google-charts';
import { SubscriptionStatistic } from '../../models/subscription-model';

@Component({
  selector: 'app-subscription-summary',
  standalone: true,
  template: `
    <div class="card border-secondary bg-dark text-light text-center">
      <h5>Summary</h5>

      <!-- Subscription Summary Chart -->
      <google-chart
        *ngIf="summaryChartData.length > 0"
        style="width: 100%;"
        [type]="chartType"
        [data]="summaryChartData"
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
      div[google-chart] {
        width: 100%;
        height: 400px;
      }
    `,
  ],
  imports: [CommonModule, GoogleChartsModule],
})
export class SubscriptionSummaryComponent implements OnInit, OnChanges {
  @Input() subscription!: SubscriptionStatistic;
  @Input() redrawTrigger: boolean = false;

  chartType: ChartType = ChartType.BarChart;
  chartColumns: string[] = ['Metric', 'Value'];
  summaryChartData: any[] = [];
  chartOptions = {
    backgroundColor: '#212529',
    colors: ['#1b9e77', '#d95f02', '#7570b3', '#e7298a'],
    legend: { textStyle: { color: 'white' }, position: 'none' },
    hAxis: { textStyle: { color: 'white' } },
    vAxis: { textStyle: { color: 'white' } },
    chartArea: { left: '15%', width: '82%', height: '85%' },
    height: 400,
    animation: {
      startup: true,
      duration: 1000,
      easing: 'out',
    },
  };

  ngOnInit(): void {
    this.updateSummaryChartData();
  }

  ngOnChanges(): void {
    this.updateSummaryChartData();
  }

  updateSummaryChartData(): void {
    // Prepare data for the summary chart
    this.summaryChartData = [
      ['Total Subscriptions', this.subscription.totalSubscribers],
      ['New Subscriptions', this.subscription.totalNewSubscribers],
      ['Renewed Subscriptions', this.subscription.totalReSubscribers],
      ['Gifted Subscriptions', this.subscription.totalGiftedSubscriptions,],
      ['Community Subscriptions', this.subscription.totalCommunitySubscriptions,],
    ];
  }
}
