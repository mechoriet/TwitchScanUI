import { Component, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { UserData } from '../../models/user.model';
import { Subscription } from 'rxjs';
import { DataService } from '../../services/app-service/data.service';
import { SettingsService } from '../../services/app-service/settings.service';

@Component({
    selector: 'app-subscription-summary',
    standalone: true,
    template: `
    <div class="h-100 w-100 m-0 px-2" *ngIf="anySubscriptions(); else noSubs">
      <canvas        
        baseChart
        [data]="summaryChartData"
        [options]="chartOptions"
        [type]="'bar'"
      >
      </canvas>
    </div>

    <ng-template #noSubs>
        <div class="card border-secondary bg-dark text-light text-center h-100 m-0 justify-content-center">
            <h5>No Subscription Data Available</h5>
        </div>
    </ng-template>
  `,
    imports: [CommonModule, BaseChartDirective],
})
export class SubscriptionSummaryComponent implements OnDestroy {
    @ViewChild(BaseChartDirective) chart!: BaseChartDirective;
    userData: UserData;
    subscriptions: Subscription = new Subscription();

    constructor(private dataService: DataService, private settingsService: SettingsService) {
        this.userData = dataService.getUserData();
        this.subscriptions.add(this.dataService.userData$.subscribe((userData) => {
            this.userData = userData;
            this.updateSummaryChartData();
        }));

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
    summaryChartData: ChartConfiguration<'bar'>['data'] = {
        labels: ['Total', 'New', 'Renewed', 'Gifted', 'Community'],
        datasets: [
            {
                label: 'Value',
                data: [],
                backgroundColor: [
                    '#1b9e77',
                    '#d95f02',
                    '#7570b3',
                    '#e7298a',
                    '#66a61e',
                ],
                borderColor: [
                    '#1b9e77',
                    '#d95f02',
                    '#7570b3',
                    '#e7298a',
                    '#66a61e',
                ],
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
        animation: false
    };

    updateSummaryChartData(): void {
        const subscription = this.userData.SubscriptionStatistic;
        // Prepare data for the summary chart
        this.summaryChartData.datasets[0].data = [
            subscription.totalSubscribers,
            subscription.totalNewSubscribers,
            subscription.totalReSubscribers,
            subscription.totalGiftedSubscriptions,
            subscription.totalCommunitySubscriptions,
        ];

        this.chart?.chart?.update();
    }

    anySubscriptions(): boolean {
        const subscription = this.userData.SubscriptionStatistic;
        return subscription.totalSubscribers > 0;
    }
}
