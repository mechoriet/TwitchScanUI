import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartType, GoogleChartsModule } from 'angular-google-charts';
import { SubscriptionStatistic } from '../../models/subscription-model';

@Component({
    selector: 'app-subscription-summary',
    standalone: true,
    template: `
    <div class="card bg-dark text-light">
      <h3>Subscription Summary</h3>
      
      <!-- Subscription Summary Chart -->
      <google-chart *ngIf="summaryChartData.length > 0" style="width: 100%;"
            [type]="chartType"
            [data]="summaryChartData" 
            [columns]="chartColumns"
            [options]="chartOptions">
      </google-chart>
    </div>
  `,
    styles: [`
    .card { border: 1px solid #ccc; padding: 1rem; margin: 0.5rem 0; }
    div[google-chart] { width: 100%; height: 400px; }
    `],
    imports: [CommonModule, GoogleChartsModule]
})
export class SubscriptionSummaryComponent implements OnInit {
    @Input() subscription!: SubscriptionStatistic;

    chartType: ChartType = ChartType.BarChart;
    chartColumns: string[] = ['Metric', 'Value'];
    summaryChartData: any[] = [];
    chartOptions = {
        backgroundColor: '#343a40',
        colors: ['#1b9e77', '#d95f02', '#7570b3', '#e7298a'],
        legend: { textStyle: { color: 'white' }, position: 'none' },
        hAxis: { textStyle: { color: 'white' } },
        vAxis: { textStyle: { color: 'white' } },
        chartArea: { 'left': '20%', 'width': '70%', 'height': '70%' },
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

    updateSummaryChartData(): void {
        // Prepare data for the summary chart
        this.summaryChartData = [
            ['Total Subscribers', this.subscription.totalSubscribers],
            ['Total New Subscribers', this.subscription.totalNewSubscribers],
            ['Total Gifted Subscriptions', this.subscription.totalGiftedSubscriptions],
            ['Average Subscription Months', this.subscription.averageSubscriptionMonths]
        ];
    }
}
