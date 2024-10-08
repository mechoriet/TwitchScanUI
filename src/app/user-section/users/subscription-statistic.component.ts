import { Component, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { SubscriptionSummaryComponent } from './subscription-summary.component';
import { SubscriptionStatistic } from '../../models/subscription-model';
import { SubscriptionsOverTimeComponent } from "./subscriptions-over-time.component";
import { fadeInOut } from '../../user-dashboard/user-dashboard.animations';
import { UserData } from '../../models/user.model';

@Component({
  selector: 'app-subscription-statistic',
  standalone: true,
  template: `
        <div class="row">
          <div class="col-12">
            <!-- Subscriptions over time chart -->
             <app-subscriptions-over-time [userData]="userData"></app-subscriptions-over-time>
          </div>
          <div class="col-12" [class.col-md-6]="topSubscribersChartData.datasets[0].data.length > 0" @fadeInOut>
            <!-- Subscription Summary Chart Component -->
            <app-subscription-summary
              [subscription]="userData.SubscriptionStatistic"
              [redrawTrigger]="redrawTrigger"
            ></app-subscription-summary>
          </div>
          <div class="col-12 col-md-6" *ngIf="topSubscribersChartData.datasets[0].data.length > 0" @fadeInOut>
            <div class="card border-secondary bg-dark text-light text-center">
              <h5>Top Gifter</h5>
              <!-- Bar Chart for Top Subscribers -->
              <canvas class="canvas"                
                baseChart
                [data]="topSubscribersChartData"
                [options]="topSubscribersChartOptions"
                [type]="'bar'"
              >
              </canvas>
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
      .canvas {
        width: 100% !important;
        height: 400px !important;
      }
      .mt-4 {
        margin-top: 1.5rem;
      }
    `,
  ],
  imports: [CommonModule, BaseChartDirective, SubscriptionSummaryComponent, SubscriptionsOverTimeComponent],
  animations: [
    fadeInOut
  ] 
})
export class SubscriptionStatisticComponent implements OnInit, OnChanges {
  @ViewChild(BaseChartDirective) chart!: BaseChartDirective;
  @Input({ required: true }) userData!: UserData;
  objectKeys = Object.keys;
  redrawTrigger: boolean = false;

  // Chart Data Structure
  topSubscribersChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [
      {
        label: 'Months',
        data: [],
        backgroundColor: 'rgba(255, 153, 0, 0.6)', // Color for bars
        borderColor: 'rgba(255, 153, 0, 1)', // Border color for bars
        borderWidth: 1,
      },
    ],
  };

  // Chart Options
  topSubscribersChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
      },
    },
    scales: {
      x: {
        ticks: {
          color: 'white',
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
    this.updateTopSubscribersChartData();
  }

  ngOnChanges(): void {
    this.updateTopSubscribersChartData();
  }

  updateTopSubscribersChartData(): void {
    const subscription: SubscriptionStatistic = this.userData.SubscriptionStatistic;
    if (!subscription.topSubscribers) return;

    // Convert topSubscribers object to array and sort by subscriptions descending
    const sortedSubscribers = Object.entries(subscription.topSubscribers)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10); // Limit to top 10 subscribers for clarity

    // Map to chart data format
    this.topSubscribersChartData.labels = sortedSubscribers.map(([subscriber]) => subscriber);
    this.topSubscribersChartData.datasets[0].data = sortedSubscribers.map(([, count]) => count);

    this.chart?.chart?.update();
  }
}
