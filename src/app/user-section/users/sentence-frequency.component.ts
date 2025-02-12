import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { DataService } from '../../services/app-service/data.service';
import { Subscription } from 'rxjs';
import { SettingsService } from '../../services/app-service/settings.service';

@Component({
    selector: 'app-sentence-frequency',
    standalone: true,
    template: `
    <div class="card border-secondary bg-dark text-light text-center m-0 h-100 px-2" *ngIf="sentenceFrequencyChartData.datasets[0].data.length > 0; else noData">
      <h5>Sentence Frequency</h5>
      <canvas
        baseChart
        [data]="sentenceFrequencyChartData"
        [options]="chartOptions"
        [type]="'bar'"
      >
      </canvas>
    </div>

    <ng-template #noData>
      <div class="card border-secondary bg-dark text-light text-center m-0 h-100 justify-content-center">
        <h5>No Sentence Frequency Data Available</h5>
      </div>
    </ng-template>
  `,
    imports: [CommonModule, BaseChartDirective],
})
export class SentenceFrequencyComponent implements OnInit, OnDestroy {
    @ViewChild(BaseChartDirective) chart!: BaseChartDirective;
    subscriptions: Subscription = new Subscription();

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

    chartOptions: ChartOptions<'bar'> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: { enabled: true },
        },
        scales: {
            x: {
                ticks: {
                    color: 'white',
                    font: { size: 10 },
                },
                grid: { color: 'rgba(255, 255, 255, 0.1)' },
            },
            y: {
                ticks: { color: '#ffffff' },
                grid: { color: 'rgba(255, 255, 255, 0.1)' },
                beginAtZero: true,
            },
        },
        backgroundColor: '#212529',
        animation: false
    };

    constructor(private dataService: DataService, private settingsService: SettingsService) {
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
        this.updateSentenceFrequencyChartData();
        this.subscriptions.add(this.dataService.userData$.subscribe(() => this.updateSentenceFrequencyChartData()));
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    updateSentenceFrequencyChartData(): void {
        const minFrequency = 2;
        const sentenceFrequency = Object.entries(this.dataService.getUserData().SentenceFrequency)
            .filter(([, frequency]) => frequency >= minFrequency)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);

        const truncateSentence = (sentence: string, maxLength: number) =>
            sentence.length > maxLength ? sentence.substring(0, maxLength) + '...' : sentence;

        this.sentenceFrequencyChartData.labels = sentenceFrequency.map(([sentence]) => truncateSentence(sentence, 20));
        this.sentenceFrequencyChartData.datasets[0].data = sentenceFrequency.map(([, frequency]) => frequency);

        this.chart?.chart?.update();
    }
}
