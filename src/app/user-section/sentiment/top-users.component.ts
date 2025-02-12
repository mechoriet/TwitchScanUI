import { Component, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import { SentimentUser } from '../../models/sentiment.model';
import { CommonModule } from '@angular/common';
import { ChartConfiguration, ChartEvent } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { SettingsService } from '../../services/app-service/settings.service';
import { Subscription } from 'rxjs';
import { DataService } from '../../services/app-service/data.service';

@Component({
  selector: 'app-top-users',
  standalone: true,
  template: `
    <div class="card border-0 bg-dark text-light text-center px-2"
        *ngIf="userChartData.datasets[0].data.length > 0; else noData">
      <h5>{{ title }}</h5>

      <!-- Bar Chart for Top Users -->
      <canvas
        baseChart
        [data]="userChartData"
        [options]="chartOptions"
        [type]="'bar'"
        class="no-drag"
      >
      </canvas>
    </div>

    <ng-template #noData>
      <div class="card border-0 bg-dark text-light text-center justify-content-center">
        <h5>No User Data Available</h5>
      </div>
    </ng-template>
  `,
  styles: [
    `
      .card {
        height: 100% !important;
      }
      canvas {
        width: 100% !important;
        height: 100% !important;
      }
    `,
  ],
  imports: [CommonModule, BaseChartDirective],
})
export class TopUsersComponent implements OnInit, OnChanges {
  @ViewChild(BaseChartDirective) chart!: BaseChartDirective;
  @Input() title: string = '';
  @Input() users: SentimentUser[] = [];
  subscriptions: Subscription = new Subscription();

  // Updated Chart Data Structure to include multiple datasets
  userChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [
      {
        label: 'Messages',
        data: [],
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
      {
        label: 'Sentiment',
        data: [],
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
        borderColor: 'rgba(153, 102, 255, 1)',
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
        display: true, // Show legend to differentiate datasets
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

  constructor(private settingsService: SettingsService, private dataService: DataService) {
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

  ngOnInit(): void {
    this.updateChartData();
  }

  ngOnChanges(): void {
    this.updateChartData();
  }

  updateChartData(): void {
    // Update chart data based on users array
    this.userChartData.labels = this.users.map(user => user.username);
    this.userChartData.datasets[0].data = this.users.map(user => user.messageCount);
    this.userChartData.datasets[1].data = this.users.map(user => user.averageCompound * 100);

    this.chart?.chart?.update();
  }

  onChartClick(event: ChartEvent, activeElements: any[]): void {
    if (activeElements.length > 0) {
      const chartElement = activeElements[0];
      const index = chartElement.index;
      const username = this.userChartData.labels ? this.userChartData.labels[index] as string : undefined;

      if (username) {
        this.dataService.chatHistorySubject.next(username);
      }
    }
  }
}