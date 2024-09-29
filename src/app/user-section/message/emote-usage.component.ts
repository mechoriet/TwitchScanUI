import { Component, Input, OnInit } from '@angular/core';
import { EmoteUsage } from '../../models/emote.model';
import { CommonModule } from '@angular/common';
import { ChartType, GoogleChartsModule } from 'angular-google-charts';

@Component({
  selector: 'app-emote-usage',
  standalone: true,
  template: `
    <div class="card bg-dark text-light text-center">
      <h3>Emote Usage</h3>
      <div class="card bg-dark text-light">        
        <google-chart *ngIf="emoteChartData.length > 0" style="width: 100%;"
              [type]="chartType"
            [data]="emoteChartData" 
            [columns]="chartColumns"
            [options]="chartOptions">
        </google-chart>
      </div>
    </div>
  `,
  styles: [`
    .card { border: 1px solid #ccc; padding: 1rem; margin: 0.5rem 0; }
    ul { list-style-type: none; padding: 0; }
    li { padding: 0.2rem 0; }
    div[google-chart] { width: 100%; height: 400px; }
  `],
  imports: [CommonModule, GoogleChartsModule]
})
export class EmoteUsageComponent implements OnInit {
  @Input() emotes: EmoteUsage[] = [];

  chartType = ChartType.BarChart
  chartColumns = ['Emote', 'Usage'];
  emoteChartData: any[] = [];
  chartOptions = {
    backgroundColor: '#343a40', // Dark background
    legend: { textStyle: { color: 'white' } },
    hAxis: { textStyle: { color: 'white' } },
    vAxis: { textStyle: { color: 'white' } },
    bars: 'vertical',
    height: 400,
    colors: ['#1b9e77'],
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
    // Populate chart data with the top 10 emote usages
    this.emoteChartData = this.emotes.slice(0, 10).map(emote => [emote.key, emote.value]);
  }
}
