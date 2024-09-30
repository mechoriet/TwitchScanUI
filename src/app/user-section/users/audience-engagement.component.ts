import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartType, GoogleChartsModule } from 'angular-google-charts';
import { UserData } from '../../models/user.model';

@Component({
  selector: 'app-audience-engagement',
  standalone: true,
  template: `
    <div class="card border-secondary bg-dark text-light p-3">
      <h4 (click)="updateTopChattersChartData(); updateWordFrequencyChartData()"
          class="pointer"
          data-bs-toggle="collapse" 
          data-bs-target="#audienceEngagementCollapse" 
          aria-expanded="true" 
          aria-controls="audienceEngagementCollapse"><i class="fa-solid fa-users me-2"></i> Audience Engagement</h4>

      <div id="audienceEngagementCollapse" class="collapse show">
        <!-- Audience Engagement Stats -->
        <div class="card border-secondary bg-dark text-light text-center">
          <p><strong>Messages:</strong> {{ userData.TotalMessages }}</p>
          <p>
            <strong>Average Length:</strong>
            {{ userData.AverageMessageLength.toFixed(2) }} characters
          </p>
        </div>

        <div class="row">
          <div class="col-12 col-md-6">
            <!-- Top Chatters Chart -->
            <div class="card border-secondary bg-dark text-light text-center">
              <h5>Top Chatters</h5>
              <google-chart
                *ngIf="topChattersChartData.length > 0"
                style="width: 100%;"
                [type]="barChartType"
                [data]="topChattersChartData"
                [columns]="topChattersChartColumns"
                [options]="chartOptions"
              >
              </google-chart>
            </div>
          </div>

          <div class="col-12 col-md-6">
            <!-- Word Frequency Chart -->
            <div class="card border-secondary bg-dark text-light text-center">
              <h5>Word Frequency</h5>
              <google-chart
                *ngIf="wordFrequencyChartData.length > 0"
                style="width: 100%;"
                [type]="barChartType"
                [data]="wordFrequencyChartData"
                [columns]="wordFrequencyChartColumns"
                [options]="chartOptions"
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
      p {
        margin: 0.5rem 0;
      }
      google-chart {
        width: 100%;
        height: 400px;
      }
    `,
  ],
  imports: [CommonModule, GoogleChartsModule],
})
export class AudienceEngagementComponent implements OnInit, OnChanges {
  @Input() userData!: UserData;

  barChartType: ChartType = ChartType.BarChart;

  // Top Chatters Chart
  topChattersChartColumns: string[] = ['User', 'Messages'];
  topChattersChartData: any[] = [];

  // Word Frequency Chart
  wordFrequencyChartColumns: string[] = ['Word', 'Frequency'];
  wordFrequencyChartData: any[] = [];

  chartOptions = {
    backgroundColor: '#212529',
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
    this.updateTopChattersChartData();
    this.updateWordFrequencyChartData();
  }

  ngOnChanges(): void {
    this.updateTopChattersChartData();
    this.updateWordFrequencyChartData();
  }

  updateTopChattersChartData(): void {
    // Convert TopChatters object to chart data format
    this.topChattersChartData = Object.entries(this.userData.TopChatters)
      .map(([chatter, messages]) => [chatter, messages])
      .slice(0, 10); // Limit to top 10 chatters
  }

  updateWordFrequencyChartData(): void {
    // Convert WordFrequency object to chart data format
    this.wordFrequencyChartData = Object.entries(this.userData.WordFrequency)
      .map(([word, frequency]) => [word, frequency])
      .slice(0, 10); // Limit to top 10 words
  }
}