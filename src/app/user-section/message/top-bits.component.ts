import { Component, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartConfiguration, ChartEvent } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { Subscription } from 'rxjs';
import { DataService } from '../../services/app-service/data.service';
import { UserData } from '../../models/user.model';
import { SettingsService } from '../../services/app-service/settings.service';

@Component({
  selector: 'app-top-bits',
  standalone: true,
  template: `
    <div class="card border-secondary bg-dark text-light text-center m-0 h-100 px-2" *ngIf="hasData(); else noBits">
    <h5>Bits Cheered</h5>   
      <canvas
        *ngIf="bitChartData.datasets[0].data.length > 0"
        class="canvas no-drag"
        baseChart
        [data]="bitChartData"
        [options]="chartOptions"
        [type]="'bar'"
      >
      </canvas>
    </div>

    <ng-template #noBits>
      <div class="card border-secondary bg-dark text-light text-center h-100 m-0 justify-content-center">
        <h5>No Bits Cheered</h5>
      </div>
    </ng-template>
  `,
  imports: [CommonModule, BaseChartDirective],
})
export class TopBitsComponent implements OnDestroy {
  @ViewChild(BaseChartDirective) chart!: BaseChartDirective;
  userData: UserData;
  subscription: Subscription = new Subscription();

  constructor(private dataService: DataService, settingsService: SettingsService) {
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
  bitChartData: ChartConfiguration<'bar'>['data'] = {
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
    onClick: (event, activeElements) => this.onChartClick(event, activeElements),
  };  
  
  hasData(): boolean {
    return (
      (this.bitChartData.datasets[0].data && (this.bitChartData.datasets[0].data as any[]).length > 1)
    );
  }

  updateChartData(): void {
    const bits = this.userData.BitsCheeredStatistic;
    const bitsObj = Array.isArray(bits)
      ? Object.fromEntries(bits.map(({ key, value }) => [key, value]))
      : bits;
    const topBitsCheered = Object.entries(bitsObj as { [key: string]: number }).sort((a, b) => b[1] - a[1]);

    const keys: string[] = [];
    const values: number[] = [];
    topBitsCheered.forEach(([key, value]) => {
      keys.push(key);
      values.push(value);
    });

    this.bitChartData.labels = keys.slice(0, 10);
    this.bitChartData.datasets[0].data = values.slice(0, 10);
    this.chart?.chart?.update();
  }

  onChartClick(event: ChartEvent, activeElements: any[]): void {
    if (activeElements.length > 0) {
      const chartElement = activeElements[0];
      const index = chartElement.index;
      const username = this.bitChartData.labels ? this.bitChartData.labels[index] as string : undefined;

      if (username) {
        this.dataService.chatHistorySubject.next(username);
      }
    }
  }
}
