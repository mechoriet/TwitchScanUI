import { Component, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import { EmoteUsage } from '../../models/emote.model';
import { CommonModule } from '@angular/common';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-emote-usage',
  standalone: true,
  template: `
    <div class="card bg-dark border-secondary text-light">
      <h5 (click)="updateChartData()"
      class="pointer">
      <i class="fa-solid fa-face-grin-tongue-wink me-2 text-warning"></i> Emotes</h5>
      <div id="emoteCollapse">
        <div class="card border-secondary bg-dark text-light text-center">     
          <h5>Emote Usage</h5>   
          <canvas
            *ngIf="emoteChartData.datasets[0].data.length > 0"
            baseChart
            [data]="emoteChartData"
            [options]="chartOptions"
            [type]="'bar'"
          >
          </canvas>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card { border: 1px solid #ccc; padding: 1rem; margin: 0.5rem 0; }
    ul { list-style-type: none; padding: 0; }
    li { padding: 0.2rem 0; }
    canvas { width: 100% !important; height: 400px !important; }
  `],
  imports: [CommonModule, BaseChartDirective]
})
export class EmoteUsageComponent implements OnInit, OnChanges {
  @ViewChild(BaseChartDirective) chart!: BaseChartDirective;
  @Input() emotes: EmoteUsage[] = [];

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
  }

  ngOnChanges(): void {
    this.updateChartData();
  }

  updateChartData(): void {
    // Populate chart data with the top 10 emote usages
    const topEmotes = this.emotes.slice(0, 10);
    this.emoteChartData.labels = topEmotes.map(emote => emote.key);
    this.emoteChartData.datasets[0].data = topEmotes.map(emote => emote.value);

    this.chart?.chart?.update();
  }
}
