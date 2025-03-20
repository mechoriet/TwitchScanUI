import { Component, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { Subscription } from 'rxjs';
import { DataService } from '../../services/app-service/data.service';
import { UserData } from '../../models/user.model';
import { SettingsService } from '../../services/app-service/settings.service';

@Component({
  selector: 'app-emote-usage',
  standalone: true,
  template: `
    <div class="m-0 h-100 w-100" *ngIf="hasData(); else noEmotes">
      <canvas
        *ngIf="emoteChartData.datasets[0].data.length > 0"
        baseChart
        [data]="emoteChartData"
        [options]="chartOptions"
        [type]="'bar'"
      >
      </canvas>
    </div>

    <ng-template #noEmotes>
      <div class="card border-secondary bg-dark text-light text-center h-100 m-0 justify-content-center">
        <h5>No Emotes Used</h5>
      </div>
    </ng-template>
  `,
  imports: [CommonModule, BaseChartDirective],
})
export class EmoteUsageComponent implements OnDestroy {
  @ViewChild(BaseChartDirective) chart!: BaseChartDirective;
  userData: UserData;
  subscription: Subscription = new Subscription();

  constructor(private dataService: DataService, private settingsService: SettingsService) {
    this.userData = dataService.getUserData();
    this.subscription.add(
      dataService.userData$.subscribe((userData) => {
        this.userData = userData;
        this.updateChartData();
      })
    );

    this.subscription.add(
      settingsService.settings$.subscribe((s) => {
        if (this.chartOptions) {
          // Update the animation setting
          this.chartOptions.animation = s.showChartAnimations;

          // Force Chart.js to re-render the chart with the new options
          if (this.chart && this.chart.chart) {
            this.chart.chart.config.options = this.chartOptions;
            this.chart.chart.update();
          }
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  // Chart Data Structure
  emoteChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [
      {
        label: 'Usage',
        data: [],
        backgroundColor: '#1b9e77',
        borderColor: '#1b9e77',
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
        display: false,
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
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart',
    },
  };

  hasData(): boolean {
    return (
      (this.emoteChartData.datasets[0].data && (this.emoteChartData.datasets[0].data as any[]).length > 0)
    );
  }

  updateChartData(): void {
    // Populate chart data with the top 10 emote usages
    const topEmotes = this.userData.EmoteUsage.slice(0, 10);
    this.emoteChartData.labels = topEmotes.map((emote) => emote.key);
    this.emoteChartData.datasets[0].data = topEmotes.map(
      (emote) => emote.value
    );

    this.chart?.chart?.update();
  }
}
