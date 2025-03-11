import { Component, ViewChild, OnDestroy } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { Trend, UserData } from '../../models/user.model';
import { DataInterpolationService } from '../../services/chart-service/data-interpolation.service';
import annotationPlugin, { AnnotationOptions } from 'chartjs-plugin-annotation';
import { Chart, ChartConfiguration } from 'chart.js';
import { _DeepPartialArray } from 'chart.js/dist/types/utils';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/app-service/data.service';
import { Subscription } from 'rxjs';
import { openStream } from '../../helper/general.helper';
import { SettingsService } from '../../services/app-service/settings.service';
import { getFormattedDateSince } from '../../helper/date.helper';

// Register the annotation plugin
Chart.register(annotationPlugin);

@Component({
  selector: 'app-channel-metrics',
  standalone: true,
  template: `
    <div class="card border-secondary bg-dark text-light chart-container text-center h-100 m-0 px-2" *ngIf="chartData.datasets.length > 0 && chartData.datasets[0].data.length > 0; else noData">
      <h5 class="m-0">
        Viewers Over Time (UTC)
        <i class="fa-solid" 
        [ngClass]="{
              'trend-stable fa-minus':
                userData.ChannelMetrics.trend === Trend.Stable,
              'trend-up fa-arrow-up':
                userData.ChannelMetrics.trend === Trend.Increasing,
              'trend-down fa-arrow-down':
                userData.ChannelMetrics.trend === Trend.Decreasing
            }">
        </i>
      </h5>
      <small class="text-muted">{{ userData.ChannelMetrics.totalWatchTime | number: '1.1-1' }}h total watchtime</small>
      <canvas class="no-drag px-2"
        (dblclick)="resetZoom()"        
        baseChart
        [data]="chartData"
        [options]="chartOptions"
        [type]="'line'"
      ></canvas>
      
      <!-- Badges for all the raiders -->
      <div class="my-1 mx-1">
        <span (click)="openChat(raid.value)" *ngFor="let raid of userData.RaidStatistic?.raidsOverTime; let last=last; let i = index; trackBy: trackByFn"
        class="badge text-dark raid-text no-drag pointer" [class.me-2]="!last" 
        [ngStyle]="{ 'background-color': getColorByKey(raid.value) }" title="{{ getFormattedDateSince(raid.key) }}">
          <small><i class="fa-solid fa-user-plus me-1"></i>{{ raid.value }}</small>
        </span>
      </div>
    </div>

    <ng-template #noData>
      <div class="card border-secondary bg-dark text-light text-center h-100 m-0 justify-content-center">
        <h5>No Viewer Data Available</h5>
      </div>
    </ng-template>
  `,
  imports: [CommonModule, BaseChartDirective],
})
export class ViewerMetricComponent implements OnDestroy {
  @ViewChild(BaseChartDirective) chart!: BaseChartDirective;
  userData!: UserData;
  subscriptions: Subscription = new Subscription();

  raidColorMap: { [key: string]: string } = {};
  defaultRaidColor = '#A2A2A2'; // Fallback color if no color is assigned

  Object = Object;
  Trend = Trend;
  getFormattedDateSince = getFormattedDateSince;
  hasCommercials = false;

  // Default colors
  regularColor = 'rgba(75, 192, 192, 1)';
  regularBackgroundColor = 'rgba(75, 192, 192, 0.2)';
  commercialColor = 'rgba(255, 165, 0, 1)';
  commercialBackgroundColor = 'rgba(255, 165, 0, 0.2)';

  // Array to track commercial time periods
  commercialPeriods: { start: Date, end: Date }[] = [];

  constructor(private interpolationService: DataInterpolationService, private dataService: DataService, private settingsService: SettingsService) {
    this.userData = dataService.getUserData();
    this.subscriptions.add(this.dataService.userData$.subscribe((userData) => {
      this.userData = userData;
      this.updateChartData();
    }));

    this.subscriptions.add(this.settingsService.settings$.subscribe((s) => {
      if (this.chartOptions) {
        // this.chartOptions.animation = s.showChartAnimations; // Disable animation for now to remove the bounching

        if (this.chart && this.chart.chart) {
          this.chart.chart.config.options = this.chartOptions;
          this.chart.chart.update();
        }
      }
    }));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  trackByFn(index: number, item: any): string {
    return item.key;
  }

  openChat(user: string): void {
    this.dataService.chatHistorySubject.next(user);
  }

  chartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [],
  };

  chartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: 'white',
          font: { size: 12 },
          boxWidth: 15,
          padding: 10,
          generateLabels: (chart) => {
            return [
              {
                text: 'Viewer Count',
                fillStyle: this.regularColor,
                strokeStyle: this.regularColor,
                lineWidth: 2,
                hidden: false,
                fontColor: 'white'
              },
              {
                text: 'Commercial',
                fillStyle: this.commercialColor,
                strokeStyle: this.commercialColor,
                lineWidth: 2,
                hidden: false,
                fontColor: 'white'
              }
            ];
          }
        },
        // Make legend non-interactive
        onClick: () => {}
      },
      tooltip: {
        enabled: true,
        callbacks: {
          title: (tooltipItems) => {
            const title = tooltipItems[0].label || '';
            const isCommercial = this.isTimeInCommercial(tooltipItems[0].label || '');
            return `${title}${isCommercial ? ' (Commercial Break)' : ''}`;
          }
        }
      },
      annotation: {
        annotations: []
      },
      zoom: {
        pan: { enabled: true },
        zoom: { wheel: { enabled: true }, pinch: { enabled: true } }
      },
    },
    scales: {
      x: { ticks: { color: 'white', font: { size: 10 } }, grid: { color: 'rgba(255, 255, 255, 0.1)' } },
      y: { ticks: { color: 'white' }, grid: { color: 'rgba(255, 255, 255, 0.1)' }, beginAtZero: true }
    },
    animation: false
  };

  resetZoom(): void {
    this.chart?.chart?.resetZoom();
  }

  updateChartData(): void {
    const metrics = this.userData?.ChannelMetrics?.viewersOverTime;
    if (!metrics) return;

    const rawData = Object.keys(metrics).map(time => ({
      time,
      value: metrics[time]
    }));

    const interpolatedData = this.interpolationService.interpolateData(rawData, 60 * 1000);

    // Get time labels and values
    const timeLabels = interpolatedData.map(entry => 
      this.interpolationService.formatTime(entry.time)
    );
    const viewerValues = interpolatedData.map(entry => entry.value);
    const dateTimes = interpolatedData.map(entry => new Date(entry.time));

    // Process commercials to set up commercial periods
    this.commercialPeriods = [];
    this.hasCommercials = false;

    if (this.userData?.CommercialStatistic?.commercialsOverTime) {
      this.processCommercials();
      this.hasCommercials = Object.keys(this.userData.CommercialStatistic.commercialsOverTime).length > 0;
    }

    // Create segments for the chart
    const segments: {
      color: string;
      backgroundColor: string;
      fromIndex: number;
      toIndex: number;
    }[] = [];
    
    let currentColor = this.regularColor;
    let currentBgColor = this.regularBackgroundColor;
    let segmentStartIndex = 0;
    
    // Create segments based on commercial periods
    for (let i = 0; i < dateTimes.length; i++) {
      const isCommercial = this.isDateInCommercial(dateTimes[i]);
      const color = isCommercial ? this.commercialColor : this.regularColor;
      const bgColor = isCommercial ? this.commercialBackgroundColor : this.regularBackgroundColor;
      
      if (color !== currentColor) {
        // End the current segment and start a new one
        segments.push({
          color: currentColor,
          backgroundColor: currentBgColor,
          fromIndex: segmentStartIndex,
          toIndex: i
        });
        
        currentColor = color;
        currentBgColor = bgColor;
        segmentStartIndex = i;
      }
    }
    
    // Add the final segment
    segments.push({
      color: currentColor,
      backgroundColor: currentBgColor,
      fromIndex: segmentStartIndex,
      toIndex: dateTimes.length
    });

    // Create datasets for each segment
    const datasets = segments.map((segment, index) => {
      const data = new Array(viewerValues.length).fill(null);
      for (let i = segment.fromIndex; i < segment.toIndex; i++) {
        data[i] = viewerValues[i];
      }
      if (segment.fromIndex > 0) {
        data[segment.fromIndex - 1] = viewerValues[segment.fromIndex - 1];
      }      
      return {
        label: 'Viewers',
        data: data,
        fill: true,
        backgroundColor: segment.backgroundColor,
        borderColor: segment.color,
        tension: 0.3,
        pointRadius: 0,
        pointHitRadius: 10,
        spanGaps: false,
      };
    });

    // Set chart data
    this.chartData = {
      labels: timeLabels,
      datasets: datasets
    };

    this.removeAnnotations();
    if ((this.userData?.RaidStatistic?.raidsOverTime?.length ?? 0) > 0) {
      this.updateAnnotations();
    }

    if (this.chart && this.chart.chart) {
      this.chart.chart.update();
    }
  }

  private processCommercials(): void {
    const commercials = this.userData?.CommercialStatistic?.commercialsOverTime;
    if (!commercials) return;

    // Create commercial periods from the data
    Object.entries(commercials).forEach(([startTimeStr, commercial]) => {
      const startTime = new Date(startTimeStr);
      const endTime = new Date(startTime.getTime() + commercial[0].length * 1000);
      
      this.commercialPeriods.push({
        start: startTime,
        end: endTime
      });
    });
  }

  // Check if a formatted time label is within a commercial period
  isTimeInCommercial(timeLabel: string): boolean {
    const parsedDate = this.parseTimeLabel(timeLabel);
    return this.isDateInCommercial(parsedDate);
  }

  private parseTimeLabel(timeLabel: string): Date {
    const today = new Date();
    const [hours, minutes] = timeLabel.split(':').map(Number);
    
    if (!isNaN(hours) && !isNaN(minutes)) {
      today.setHours(hours, minutes, 0, 0);
    }
    
    return today;
  }

  // Check if a Date object is within any commercial period
  isDateInCommercial(date: Date): boolean {
    return this.commercialPeriods.some(period => 
      date >= period.start && date <= period.end
    );
  }

  removeAnnotations(): void {
    if (!this.chartOptions!.plugins?.annotation?.annotations?.length) return;

    this.chartOptions = {
      ...this.chartOptions,
      plugins: {
        ...this.chartOptions!.plugins,
        annotation: {
          annotations: []
        }
      }
    };
  }

  private updateAnnotations(): void {
    const raids = this.userData?.RaidStatistic?.raidsOverTime;
    if (!raids) return;

    if (!this.chartOptions!.plugins!.annotation!.annotations) {
      this.chartOptions!.plugins!.annotation!.annotations = [];
    }

    raids.forEach((raid, index) => {
      const raidKey = raid.value;
      if (!this.raidColorMap[raidKey]) {
        this.raidColorMap[raidKey] = this.getDynamicColor(index);
      }

      const annotation = {
        type: 'line' as const,
        mode: 'vertical',
        scaleID: 'x',
        value: this.interpolationService.formatTime(new Date(raid.key)),
        borderColor: this.raidColorMap[raidKey],
        borderWidth: 1,
        label: {
          enabled: true,
          content: `Raid`,
          position: 'end' as const,
          backgroundColor: 'rgba(255,0,0,0.7)',
          font: { size: 10 },
        },
      };

      (this.chartOptions!.plugins!.annotation!.annotations as _DeepPartialArray<AnnotationOptions>).push(annotation);
    });

    this.chartOptions = {
      ...this.chartOptions,
      plugins: {
        ...this.chartOptions!.plugins,
        annotation: {
          annotations: [...(this.chartOptions!.plugins!.annotation!.annotations as _DeepPartialArray<AnnotationOptions>)],
        }
      }
    };
  }

  private getDynamicColor(index: number): string {
    const colors = ['#D9A2A2', '#A2D9D9', '#A2A2D9', '#D9A2D2', '#D9D9A2', '#A2D9A2', '#D2A2D9', '#D2D9A2', '#D2A2A2', '#D2D2A2'];
    return colors[index % colors.length];
  }

  getColorByKey(key: string): string {
    return this.raidColorMap[key] || this.defaultRaidColor;
  }
}