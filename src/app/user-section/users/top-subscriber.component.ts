import { Component, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartConfiguration, ChartEvent } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { SubscriptionSummaryComponent } from './subscription-summary.component';
import { SubscriptionStatistic } from '../../models/subscription-model';
import { SubscriptionsOverTimeComponent } from './subscriptions-over-time.component';
import { UserData } from '../../models/user.model';
import { Subscription } from 'rxjs';
import { DataService } from '../../services/app-service/data.service';
import { SettingsService } from '../../services/app-service/settings.service';

@Component({
  selector: 'app-subscription-statistic',
  standalone: true,
  template: `
    <div class="h-100 w-100 m-0 px-2" *ngIf="topSubscribersChartData.datasets[0].data.length > 0; else noSubs">
      <!-- Bar Chart for Top Subscribers -->
      <canvas
        class="canvas no-drag"
        baseChart
        [data]="topSubscribersChartData"
        [options]="chartOptions"
        [type]="'bar'"
      >
      </canvas>
    </div>

    <ng-template #noSubs>
        <div class="card border-secondary bg-dark text-light text-center h-100 m-0 justify-content-center">
            <h5>No Top Gifter</h5>
        </div>
    </ng-template>
  `,
  imports: [
    CommonModule,
    BaseChartDirective
],
})
export class TopSubscriberComponent implements OnDestroy {
  @ViewChild(BaseChartDirective) chart!: BaseChartDirective;
  userData!: UserData;
  subscriptions: Subscription = new Subscription();
  
  constructor(private dataService: DataService, private settingsService: SettingsService) {
    this.userData = dataService.getUserData();
    this.subscriptions.add(
      this.dataService.userData$.subscribe((userData) => {
        this.userData = userData;
        this.updateTopSubscribersChartData();
      })
    );

    this.subscriptions.add(this.settingsService.settings$.subscribe((s) => {
      if (this.chartOptions) {
        // Update the animation setting
        this.chartOptions.animation = s.showChartAnimations;
    
        // Force Chart.js to re-render the chart with the new options
        if (this.chart && this.chart.chart) {
          this.chart.chart.config.options = this.chartOptions;
          this.chart.chart.update();
        }
      }
    }));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
  
  // Chart Data Structure
  topSubscribersChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [
      {
        label: 'Gifted Subscriptions',
        data: [],
        backgroundColor: 'rgba(255, 153, 0, 0.6)', // Color for bars
        borderColor: 'rgba(255, 153, 0, 1)', // Border color for bars
        borderWidth: 1,
      },
    ],
  };

  // Chart Options
  chartOptions: ChartConfiguration<'bar'>['options'] = {
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
    animation: false,
    onClick: (event, activeElements) => this.onChartClick(event, activeElements),
  };

  updateTopSubscribersChartData(): void {
    const subscription: SubscriptionStatistic =
      this.userData.SubscriptionStatistic;
    if (!subscription.topSubscribers) return;

    // Convert topSubscribers object to array and sort by subscriptions descending
    const sortedSubscribers = Object.entries(subscription.topSubscribers)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10); // Limit to top 10 subscribers for clarity

    // Map to chart data format
    this.topSubscribersChartData.labels = sortedSubscribers.map(
      ([subscriber]) => subscriber
    );
    this.topSubscribersChartData.datasets[0].data = sortedSubscribers.map(
      ([, count]) => count
    );

    this.chart?.chart?.update();
  }

  onChartClick(event: ChartEvent, activeElements: any[]): void {
    if (activeElements.length > 0) {
      const chartElement = activeElements[0];
      const index = chartElement.index;
      const username = this.topSubscribersChartData.labels ? this.topSubscribersChartData.labels[index] as string : undefined;

      if (username) {
        this.dataService.chatHistorySubject.next(username);
      }
    }
  }
}
