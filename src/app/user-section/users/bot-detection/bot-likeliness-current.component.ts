import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartEvent } from 'chart.js';
import { Subscription } from 'rxjs';
import { DataService } from '../../../services/app-service/data.service';

@Component({
  selector: 'app-bot-likeliness-current',
  standalone: true,
  template: `
    <div class="card border-0 bg-dark text-light text-center px-2 m-0 h-100" *ngIf="botLikelinessChartData.datasets[0].data.length > 0; else noData">
      <h5>Top Suspicious Users</h5>
      <canvas
        baseChart
        [data]="botLikelinessChartData"
        [options]="chartOptions"
        [type]="'bar'"
      ></canvas>
    </div>

    <ng-template #noData>
      <div class="card border-0 bg-dark text-light text-center justify-content-center">
        <h5>No Suspicious User Data Available</h5>
      </div>
    </ng-template>
  `,
  imports: [CommonModule, BaseChartDirective],
})
export class BotLikelinessCurrentComponent implements OnInit, OnDestroy {
  @ViewChild(BaseChartDirective) chart!: BaseChartDirective;
  subscriptions: Subscription = new Subscription();

  botLikelinessChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [
      {
        label: 'Bot Likeliness (%)',
        data: [],
        backgroundColor: 'rgba(255, 159, 64, 0.6)',
        borderColor: 'rgba(255, 159, 64, 1)',
        borderWidth: 1,
      },
    ],
  };

  chartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true },
      tooltip: { enabled: true },
    },
    scales: {
      x: {
        ticks: { color: 'white', font: { size: 10 } },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
      },
      y: {
        ticks: { color: 'white' },
        beginAtZero: true,
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
      },
    },
    animation: false,
    onClick: (event, activeElements) => this.onChartClick(event, activeElements),
  };

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.updateChartData();
    this.subscriptions.add(this.dataService.userData$.subscribe(() => this.updateChartData()));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  updateChartData(): void {
    const botLikeliness = this.dataService.getUserData().BotLikeliness.topSuspiciousUsers;

    this.botLikelinessChartData.labels = botLikeliness.map(user => user.username);
    this.botLikelinessChartData.datasets[0].data = botLikeliness.map(user => user.likelinessPercentage);

    this.chart?.chart?.update();
  }

  onChartClick(event: ChartEvent, activeElements: any[]): void {
    if (activeElements.length > 0) {
      const chartElement = activeElements[0];
      const index = chartElement.index;
      const username = this.botLikelinessChartData.labels ? this.botLikelinessChartData.labels[index] as string : undefined;

      if (username) {
        this.dataService.chatHistorySubject.next(username);
      }
    }
  }
}
