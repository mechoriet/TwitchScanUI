import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectionStrategy, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HistoryTimeline } from '../../models/historical.model';

@Component({
  selector: 'app-heatmap-selection',
  standalone: true,
  template: `
    <div class="year-selection">
      <button class="btn border-0" (click)="changeYear(-1)"><i class="fas fa-chevron-left text-light"></i></button>
      <span class="year-label text-light pointer" (click)="resetYear()">{{ selectedYear }}</span>
      <button class="btn border-0" (click)="changeYear(1)"><i class="fas fa-chevron-right text-light"></i></button>
    </div>
    <i
      class="fas fa-info-circle text-light ms-2 position-absolute"
      data-toggle="tooltip"
      data-placement="top"
      title="Hover over days to see stream information. Click on a day to view the stream details. Return to current year by clicking on the year label."
    ></i>
    <div class="heatmap-container position-relative">
      <div class="week-header">
        <div class="corner-cell"></div>
        <div *ngFor="let week of heatmap; let i = index" class="week-number text-muted">
          {{ i + 1 }}
        </div>
      </div>
      <div *ngFor="let day of daysOfWeek; let i = index" class="day-row">
        <div class="day-label text-muted">{{ day.substring(0,2) }}</div>
        <div *ngFor="let week of heatmap" class="day border-secondary"
             [ngStyle]="{ 'background-color': getColor(week[i]) }"
             (click)="onDayClick(week[i])"
             [attr.title]="formatDate(week[i])">
        </div>
      </div>
    </div>
    <button *ngIf="isHistorySelected" class="btn btn-outline-secondary position-absolute top-0 end-0 m-2" (click)="unselectHistory()"><i class="fas fa-rotate-left"></i></button>
  `,
  styleUrls: ['./heatmap-selection.component.scss'],
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeatmapSelectionComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() timelines: HistoryTimeline[] = [];
  @Output() idSelected = new EventEmitter<string | undefined>();
  isHistorySelected: boolean = false;

  heatmap: Array<Array<HistoryTimeline | string>> = [];
  daysOfWeek: string[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  selectedYear: number = new Date().getUTCFullYear();

  ngOnInit(): void {
    this.generateHeatmap();
  }

  ngAfterViewInit(): void {
    document.addEventListener('click', this.onDocumentClick.bind(this));
  }

  ngOnDestroy(): void {
    document.removeEventListener('click', this.onDocumentClick.bind(this));
  }

  onDocumentClick(event: MouseEvent): void {
    const collapseElement = document.getElementById('viewCountHistory');
    if (collapseElement && !collapseElement.contains(event.target as Node)) {
      (collapseElement as HTMLElement).classList.remove('show');
    }
  }

  changeYear(delta: number): void {
    this.selectedYear += delta;    
    this.generateHeatmap();
  }

  resetYear(): void {
    this.selectedYear = new Date().getUTCFullYear();
    this.generateHeatmap();
  }

  generateHeatmap(): void {
    const weeks: Array<Array<HistoryTimeline | string>> = [];
    const year = this.selectedYear;
    const janFirst = new Date(Date.UTC(year, 0, 1));
    const decLast = new Date(Date.UTC(year, 11, 31));

    let currentDate = new Date(janFirst);
    let currentWeek: Array<HistoryTimeline | string> = new Array(janFirst.getUTCDay()).fill('');

    // Fill in all days of the selected year
    while (currentDate <= decLast) {
      const dayOfWeek = currentDate.getUTCDay();
      currentWeek[dayOfWeek] = currentDate.toDateString();

      if (dayOfWeek === 6) {
        weeks.push(currentWeek);
        currentWeek = [];
      }

      currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }

    // Push the last week if it wasn't completed
    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }

    // Fill in the first week to complete the calendar (days before Jan 1)
    if (weeks.length > 0 && weeks[0].length < 7) {
      weeks[0] = [...new Array(7 - weeks[0].length).fill(''), ...weeks[0]];
    }

    // Populate heatmap with actual timeline data
    this.timelines.forEach((timeline) => {
      const date = new Date(timeline.time);
      if (date.getUTCFullYear() === year) {
        const weekOfYear = this.getWeekOfYear(date);
        const dayOfWeek = date.getUTCDay();

        if (weekOfYear < weeks.length) {
          weeks[weekOfYear][dayOfWeek] = timeline;
        }
      }
    });

    this.heatmap = weeks;
  }

  getWeekOfYear(date: Date): number {
    const startOfYear = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    const dayOfYear = Math.floor((date.getTime() - startOfYear.getTime()) / 86400000) + startOfYear.getUTCDay();
    return Math.floor(dayOfYear / 7);
  }

  getColor(day: HistoryTimeline | string): string {
    if (typeof day === 'string' || day === undefined) {
      return `rgb(28, 28, 28)`;
    }

    const averageViewers = day.averageViewers;
    if (averageViewers === 0) {
      return `rgb(28, 28, 28)`;
    }

    const maxViewers = Math.max(...this.timelines.map(t => t.peakViewers));
    const intensity = (averageViewers - 0) / (maxViewers - 0);
    const greenIntensity = Math.floor(intensity * 255);

    return `rgba(28, ${greenIntensity}, 28, .8)`;
  }

  onDayClick(day: HistoryTimeline | string): void {
    if (typeof day !== 'string') {
      this.idSelected.emit(day.id);
      this.isHistorySelected = true;
    }
  }

  unselectHistory(): void {
    this.isHistorySelected = false;
    this.idSelected.emit(undefined);
  }

  formatDate(day: HistoryTimeline | string): string {
    if (typeof day === 'string' || day === undefined) {
      return day ? new Date(day).toDateString() : 'Invalid Date';
    }

    return `${new Date(day.time).toDateString()}\n${day.averageViewers} viewers`;
  }
}
