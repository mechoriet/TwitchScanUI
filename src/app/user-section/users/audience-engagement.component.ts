import { Component, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartConfiguration, ChartOptions, ChartType } from 'chart.js';
import { UserData } from '../../models/user.model';
import { BaseChartDirective } from 'ng2-charts';
import { SubscriptionStatisticComponent } from "./subscription-statistic.component";
import { fadeInOut } from '../../user-dashboard/user-dashboard.animations';

@Component({
  selector: 'app-audience-engagement',
  standalone: true,
  template: `
    <div class="card border-secondary bg-dark text-light p-3">
      <h5
        (click)="toggleCollapse()"
        class="pointer"
        data-bs-toggle="collapse"
        [attr.data-bs-target]="'#' + collapseId"
        aria-expanded="true"
        [attr.aria-controls]="collapseId"
      >
        <i class="fa-solid fa-star me-2 text-warning"></i> Engagement
      </h5>

      <div [id]="collapseId" class="collapse show">
        <!-- Audience Engagement Stats -->
        <div class="row">
          <ng-container>
            <app-subscription-statistic [subscription]="userData.SubscriptionStatistic"></app-subscription-statistic>
          </ng-container>
          <div class="col-12" [class.col-md-6]="sentenceFrequencyChartData.datasets[0].data.length > 0" @fadeInOut>
            <!-- Top Chatters Chart -->
            <div class="card border-secondary bg-dark text-light text-center p-3" *ngIf="topChattersChartData.datasets[0].data.length > 0" @fadeInOut>
              <h5>Top Chatters</h5>
              <canvas                
                baseChart
                [data]="topChattersChartData"
                [options]="barChartOptions"
                [type]="'bar'"
              >
              </canvas>
            </div>
          </div>

          <div class="col-12 col-md-6" *ngIf="sentenceFrequencyChartData.datasets[0].data.length > 0" @fadeInOut>
            <!-- Sentence Frequency Chart -->
            <div class="card border-secondary bg-dark text-light text-center p-3">
              <h5>Sentence Frequency</h5>
              <canvas                
                baseChart
                [data]="sentenceFrequencyChartData"
                [options]="barChartOptions"
                [type]="'bar'"
              >
              </canvas>
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
      canvas {
        width: 100% !important;
        height: 400px !important;
      }
      .pointer {
        cursor: pointer;
      }
    `,
  ],
  imports: [CommonModule, BaseChartDirective, SubscriptionStatisticComponent],
  animations: [
    fadeInOut
  ] 
})
export class AudienceEngagementComponent implements OnInit, OnChanges {
  @ViewChild(BaseChartDirective) chart!: BaseChartDirective;
  @Input() userData!: UserData;

  // Unique ID for collapse element to handle multiple instances
  collapseId = `audienceEngagementCollapse-${Math.random().toString(36).substring(2, 11)}`;

  // Top Chatters Chart Data
  topChattersChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [
      {
        label: 'Messages',
        data: [],
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Sentence Frequency Chart Data
  sentenceFrequencyChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [
      {
        label: 'Frequency',
        data: [],
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255,99,132,1)',
        borderWidth: 1,
      },
    ],
  };

  // Chart Options
  barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Hide legend if not needed
      },
      tooltip: {
        enabled: true,
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#ffffff',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
      y: {
        ticks: {
          color: '#ffffff',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        beginAtZero: true,
      },
    },
    backgroundColor: '#212529',
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart',
    },
  };

  ngOnInit(): void {
    this.updateTopChattersChartData();
    this.updateSentenceFrequencyChartData();
  }

  ngOnChanges(): void {
    this.updateTopChattersChartData();
    this.updateSentenceFrequencyChartData();
  }

  toggleCollapse(): void {
    // Optionally handle any additional logic when the header is clicked
    // Currently, Bootstrap handles the collapse functionality
  }

  updateTopChattersChartData(): void {
    const topChatters = Object.entries(this.userData.TopChatters)
      .sort((a, b) => b[1] - a[1]) // Sort descending by message count
      .slice(0, 10); // Limit to top 10

    this.topChattersChartData.labels = topChatters.map(([chatter]) => chatter);
    this.topChattersChartData.datasets[0].data = topChatters.map(([, messages]) => messages);

    this.chart?.chart?.update();
  }

  updateSentenceFrequencyChartData(): void {
    // Filter SentenceFrequency: { [key: string]: number }; to have at least a frequency of 2
    const minFrequency = 2;
    this.userData.SentimentAnalysis.topPositiveMessages
    this.userData.SentenceFrequency = Object.entries(this.userData.SentenceFrequency)
      .filter(([, frequency]) => frequency >= minFrequency)
      .reduce((obj, [key, value]) => {
        obj[key] = value;
        return obj;
      }, {} as { [key: string]: number });

    const sentenceFrequency = Object.entries(this.userData.SentenceFrequency)
      .sort((a, b) => b[1] - a[1]) // Sort descending by frequency
      .slice(0, 10); // Limit to top 10

    const truncateSentence = (sentence: string, maxLength: number) => {
      return sentence.length > maxLength ? sentence.substring(0, maxLength) + '...' : sentence;
    };

    sentenceFrequency.forEach(([sentence, frequency], index) => {
      sentenceFrequency[index][0] = truncateSentence(sentence, 20);
    });

    this.sentenceFrequencyChartData.labels = sentenceFrequency.map(([sentence]) => truncateSentence(sentence, 20));
    this.sentenceFrequencyChartData.datasets[0].data = sentenceFrequency.map(([, frequency]) => frequency);

    this.chart?.chart?.update();
  }
}
