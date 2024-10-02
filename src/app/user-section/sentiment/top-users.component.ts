import { Component, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import { SentimentUser } from '../../models/sentiment.model';
import { CommonModule } from '@angular/common';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-top-users',
  standalone: true,
  template: `
    <div class="card border-secondary bg-dark text-light text-center">
      <h5>{{ title }}</h5>

      <!-- Bar Chart for Top Users -->
      <canvas
        *ngIf="userChartData.datasets[0].data.length > 0"
        baseChart
        [data]="userChartData"
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
export class TopUsersComponent implements OnInit, OnChanges {
  @ViewChild(BaseChartDirective) chart!: BaseChartDirective;
  @Input() title: string = '';
  @Input() users: SentimentUser[] = [];
  @Input() positive: boolean = true;
  @Input() redrawTrigger: boolean = false;

  // Chart Data Structure
  userChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [
      {
        label: 'Sentiment (%)',
        data: [],
        backgroundColor: '#4285F4',
        borderColor: '#4285F4',
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
        display: false, // Hide legend for simplicity
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
    this.updateChartData();

    // Change bar color to red if negative sentiment
    if (!this.positive) {
      this.userChartData.datasets[0].backgroundColor = 'rgba(255, 99, 132, 0.6)';
      this.userChartData.datasets[0].borderColor = 'rgba(255,99,132,1)';
    }
  }

  ngOnChanges(): void {
    this.updateChartData();
  }

  updateChartData(): void {
    // Populate chart data based on the users' average positive sentiment
    this.userChartData.labels = this.users.map((user) => user.username);
    this.userChartData.datasets[0].data = this.users.map(
      (user) => user.averageCompound * 100
    );
    
    this.chart?.chart?.update();
  }
}
