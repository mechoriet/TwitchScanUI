import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartType, GoogleChartsModule } from 'angular-google-charts';
import { SubscriptionSummaryComponent } from './subscription-summary.component';
import { SubscriptionStatistic } from '../../models/subscription-model';

@Component({
  selector: 'app-subscription-statistic',
  standalone: true,
  template: `
    <div
      class="card border-secondary bg-dark text-light">
      <h4 (click)="updateTopSubscribersChartData(); redrawTrigger = !redrawTrigger"
      class="pointer"
      data-bs-toggle="collapse"
      data-bs-target="#subscriptionCollapse"
      aria-expanded="true"
      aria-controls="subscriptionCollapse"><i class="fa-solid fa-star me-2"></i> Subscriptions</h4>
      <div id="subscriptionCollapse" class="collapse show">
        <div class="row">
          <div class="col-12 col-md-6">
            <!-- Subscription Summary Chart Component -->
            <app-subscription-summary
              [subscription]="subscription"
              [redrawTrigger]="redrawTrigger"
            ></app-subscription-summary>
          </div>
          <div class="col-12 col-md-6">
            <div class="card border-secondary bg-dark text-light text-center">
              <h5>Top Subscribers</h5>
              <!-- Google Bar Chart for Top Subscribers -->
              <google-chart
                *ngIf="topSubscribersChartData.length > 0"
                style="width: 100%;"
                [type]="topSubscribersChartType"
                [data]="topSubscribersChartData"
                [columns]="topSubscribersChartColumns"
                [options]="topSubscribersChartOptions"
              >
              </google-chart>
            </div>
          </div>
        </div>
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
      ul {
        list-style-type: none;
        padding: 0;
      }
      li {
        padding: 0.2rem 0;
      }
      google-chart {
        width: 100%;
        height: 400px;
      }
      .mt-4 {
        margin-top: 1.5rem;
      }
    `,
  ],
  imports: [CommonModule, GoogleChartsModule, SubscriptionSummaryComponent],
})
export class SubscriptionStatisticComponent implements OnInit, OnChanges {
  @Input() subscription!: SubscriptionStatistic;
  objectKeys = Object.keys;
  redrawTrigger: boolean = false;

  // Top Subscribers Chart configurations
  topSubscribersChartType: ChartType = ChartType.BarChart;
  topSubscribersChartColumns: string[] = ['Subscriber', 'Months'];
  topSubscribersChartData: any[] = [];
  topSubscribersChartOptions = {
    backgroundColor: '#212529',
    colors: ['#ff9900'], // Customize as needed
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
    this.updateTopSubscribersChartData();
  }

  ngOnChanges(): void {
    this.updateTopSubscribersChartData();
  }

  updateTopSubscribersChartData(): void {
    // Convert topSubscribers object to array and sort by subscriptions descending
    const sortedSubscribers = Object.entries(this.subscription.topSubscribers)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10); // Limit to top 10 subscribers for clarity

    // Map to chart data format
    this.topSubscribersChartData = sortedSubscribers.map(
      ([subscriber, count]) => [subscriber, count]
    );
  }
}
