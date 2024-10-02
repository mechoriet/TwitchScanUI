import { Component, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { SubscriptionStatistic } from '../../models/subscription-model';

@Component({
    selector: 'app-subscription-summary',
    standalone: true,
    template: `
    <div class="card border-secondary bg-dark text-light text-center">
      <h5>Summary</h5>

      <!-- Subscription Summary Chart -->
      <canvas
        *ngIf="summaryChartData.datasets[0].data.length > 0"
        baseChart
        [data]="summaryChartData"
        [options]="chartOptions"
        [type]="'bar'"
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
    `,
    ],
    imports: [CommonModule, BaseChartDirective],
})
export class SubscriptionSummaryComponent implements OnInit, OnChanges {
    @ViewChild(BaseChartDirective) chart!: BaseChartDirective;
    @Input() subscription!: SubscriptionStatistic;
    @Input() redrawTrigger: boolean = false;

    // Chart Data Structure
    summaryChartData: ChartConfiguration<'bar'>['data'] = {
        labels: ['Total Subscriptions', 'New Subscriptions', 'Renewed Subscriptions', 'Gifted Subscriptions', 'Community Subscriptions'],
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
        this.updateSummaryChartData();
    }

    ngOnChanges(): void {
        this.updateSummaryChartData();
    }

    updateSummaryChartData(): void {
        // Prepare data for the summary chart
        this.summaryChartData.datasets[0].data = [
            this.subscription.totalSubscribers,
            this.subscription.totalNewSubscribers,
            this.subscription.totalReSubscribers,
            this.subscription.totalGiftedSubscriptions,
            this.subscription.totalCommunitySubscriptions,
        ];

        this.chart?.chart?.update();
    }
}
