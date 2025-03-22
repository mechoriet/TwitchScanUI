import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartEvent, ChartOptions } from 'chart.js';
import { DataService } from '../../services/app-service/data.service';
import { Subscription } from 'rxjs';
import { SettingsService } from '../../services/app-service/settings.service';

@Component({
  selector: 'app-top-chatter',
  standalone: true,
  template: `
    <div class="m-0 w-100 h-100" *ngIf="topChattersChartData.datasets[0].data.length > 0; else noData">
      <canvas
        baseChart
        [data]="topChattersChartData"
        [options]="chartOptions"
        [type]="'bar'"
        class="no-drag"
      >
      </canvas>
    </div>

    <ng-template #noData>
      <div class="card border-secondary bg-dark text-light text-center m-0 h-100 justify-content-center">
        <h5>No Top Chatter Data Available</h5>
      </div>
    </ng-template>
  `,
  imports: [CommonModule, BaseChartDirective],
})
export class TopChatterComponent implements OnInit, OnDestroy {
  @ViewChild(BaseChartDirective) chart!: BaseChartDirective;
  subscriptions: Subscription = new Subscription();

  topChattersChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [
      {
        label: 'Messages',
        data: [],
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
        yAxisID: 'y-message',
      },
      {
        label: 'Positive Sentiment',
        data: [],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        yAxisID: 'y-sentiment',
      },
      {
        label: 'Negative Sentiment',
        data: [],
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
        yAxisID: 'y-sentiment',
      },
      {
        label: 'Compound Sentiment',
        data: [],
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
        yAxisID: 'y-sentiment',
      },
    ],
  };

  chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: 'white', font: { size: 10 } },
      },
      tooltip: { enabled: true },
    },
    scales: {
      x: {
        ticks: {
          color: 'white',
        },
      },
      y: {
        ticks: {
          color: 'white',
        },
      },
    },
    backgroundColor: '#212529',
    animation: false,
    onClick: (event, activeElements) => this.onChartClick(event, activeElements),
  };

  constructor(private dataService: DataService, private settingsService: SettingsService) {
    this.subscriptions.add(this.settingsService.settings$.subscribe((s) => {
      if (this.chartOptions) {
        this.chartOptions.animation = s.showChartAnimations;
        if (this.chart && this.chart.chart) {
          this.chart.chart.config.options = this.chartOptions;
          this.chart.chart.update();
        }
      }
    }));
  }

  ngOnInit(): void {
    this.updateTopChattersChartData();
    this.subscriptions.add(this.dataService.userData$.subscribe(() => this.updateTopChattersChartData()));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  updateTopChattersChartData(): void {
    const topChatters = this.dataService.getUserData().SentimentAnalysis.topUsers;

    this.topChattersChartData.labels = topChatters.map(user => user.username);
    this.topChattersChartData.datasets[0].data = topChatters.map(user => user.messageCount);
    this.topChattersChartData.datasets[1].data = topChatters.map(user => user.averagePositive * 100);
    this.topChattersChartData.datasets[2].data = topChatters.map(user => user.averageNegative * 100);
    this.topChattersChartData.datasets[3].data = topChatters.map(user => user.averageCompound * 100);

    this.chart?.chart?.update();
  }

  onChartClick(event: ChartEvent, activeElements: any[]): void {
    if (activeElements.length > 0) {
      const chartElement = activeElements[0];
      const index = chartElement.index;
      const username = this.topChattersChartData.labels ? this.topChattersChartData.labels[index] as string : null;

      if (username) {
        this.dataService.chatHistorySubject.next(username);
      }
    }
  }
}