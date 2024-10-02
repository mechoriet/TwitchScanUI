import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { SentimentMessage } from '../../models/sentiment.model';
import { CommonModule } from '@angular/common';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

@Component({
    selector: 'app-top-messages',
    standalone: true,
    template: `
      <div class="row">
        <div class="card border-secondary bg-dark text-light text-center col-12 col-md-6">
          <h5>Top Positive Messages</h5>
          <canvas *ngIf="positiveChartData.datasets[0].data.length > 0"
            baseChart
            [data]="positiveChartData"
            [options]="chartOptions"
            [type]="'bar'">
          </canvas>
        </div>
        <div class="card border-secondary bg-dark text-light text-center col-12 col-md-6">
          <h5>Top Negative Messages</h5>
          <canvas *ngIf="negativeChartData.datasets[0].data.length > 0"
            baseChart
            [data]="negativeChartData"
            [options]="chartOptions"
            [type]="'bar'">
          </canvas>
        </div>
      </div>
  `,
    styles: [`
    .card { border: 1px solid #ccc; padding: 1rem; margin: 0.5rem 0; }
    canvas { width: 100% !important; height: 400px !important; }
  `],
    imports: [CommonModule, BaseChartDirective]
})
export class TopMessagesComponent implements OnInit, OnChanges {
    @Input() topPositiveMessages: SentimentMessage[] = [];
    @Input() topNegativeMessages: SentimentMessage[] = [];

    // Positive Messages Chart Data Structure
    positiveChartData: ChartConfiguration<'bar'>['data'] = {
        labels: [],
        datasets: [
            {
                label: 'Compound Score',
                data: [],
                backgroundColor: '#1b9e77',
                borderColor: '#1b9e77',
                borderWidth: 1,
            },
        ],
    };

    // Negative Messages Chart Data Structure
    negativeChartData: ChartConfiguration<'bar'>['data'] = {
        labels: [],
        datasets: [
            {
                label: 'Compound Score',
                data: [],
                backgroundColor: '#d95f02',
                borderColor: '#d95f02',
                borderWidth: 1,
            },
        ],
    };

    // Chart Options
    chartOptions: ChartConfiguration<'bar'>['options'] = {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y', // Horizontal bar chart
        plugins: {
            legend: {
                display: false, // Hide legend as it's unnecessary here
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
            },
        },
        animation: {
            duration: 1000,
            easing: 'easeInOutQuart',
        },
    };

    ngOnInit(): void {
        this.updateChartData();
    }

    ngOnChanges(): void {
        this.updateChartData();
    }

    updateChartData(): void {
        // Prepare top positive messages data
        this.positiveChartData.labels = this.topPositiveMessages.map(
            message => `${message.username}: ${message.message}`
        );
        this.positiveChartData.datasets[0].data = this.topPositiveMessages.map(
            message => message.compound
        );

        // Prepare top negative messages data
        this.negativeChartData.labels = this.topNegativeMessages.map(
            message => `${message.username}: ${message.message}`
        );
        this.negativeChartData.datasets[0].data = this.topNegativeMessages.map(
            message => message.compound
        );
    }
}
