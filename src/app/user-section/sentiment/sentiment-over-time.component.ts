import { Component, Input, OnInit } from '@angular/core';
import { SentimentOverTime } from '../../models/sentiment.model';
import { CommonModule } from '@angular/common';
import { ChartType, GoogleChartsModule } from 'angular-google-charts';

@Component({
    selector: 'app-sentiment-over-time',
    standalone: true,
    template: `
    <div class="card bg-dark text-light text-center">
      <h4>Sentiment Over Time</h4>
      
      <!-- Google Line Chart -->
      <google-chart *ngIf="chartData.length > 0" style="width: 100%;"
            [type]="chartType"
            [data]="chartData" 
            [columns]="chartColumns"
            [options]="chartOptions">
      </google-chart>
  `,
    styles: [`
    .card { border: 1px solid #ccc; padding: 1rem; margin: 0.5rem 0; }
    table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
    th, td { border: 1px solid #ddd; padding: 0.5rem; text-align: center; }
    th { background-color: #495057; color: white; }
    `],
    imports: [CommonModule, GoogleChartsModule]
})
export class SentimentOverTimeComponent implements OnInit {
    @Input() data: SentimentOverTime[] = [];

    chartType: ChartType = ChartType.LineChart;
    chartColumns: string[] = ['Time', 'Positive', 'Negative', 'Neutral', 'Compound'];
    chartData: any[] = [];
    chartOptions = {
        backgroundColor: '#343a40',
        colors: ['#1b9e77', '#d95f02', '#7570b3', '#e7298a'],
        legend: { textStyle: { color: 'white' } },
        hAxis: { textStyle: { color: 'white', fontSize: 10 } },
        vAxis: { 
          textStyle: { color: 'white' }, 
          viewWindowMode:'explicit',
          viewWindow:{
            max:100,
            min:0
          }
        },
        tooltip: { textStyle: { color: 'black' }, showColorCode: true },
        height: 400,
        chartArea: {'left': '5%', 'width': '80%', 'height': '75%'},
        animation: {
            startup: true,
            duration: 1000,
            easing: 'out',
        },
    };

    ngOnInit(): void {
        this.updateChartData();
    }

    updateChartData(): void {
        // Initialize chart data with columns
        this.chartData = this.data.map(entry => [
            this.formatTime(entry.time),
            entry.averagePositive * 100,
            entry.averageNegative * 100,
            entry.averageNeutral * 100,
            entry.averageCompound
        ]);
    }

    formatTime(time: string): string {
        var date = new Date(time);
        var hours = date.getHours().toString().padStart(2, '0');
        var minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }
}