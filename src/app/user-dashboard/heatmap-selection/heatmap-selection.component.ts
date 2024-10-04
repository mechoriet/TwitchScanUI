import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HistoryTimeline } from '../../models/historical.model';

@Component({
  selector: 'app-heatmap-selection',
  standalone: true,
  template: `
    <div class="heatmap-container p-2">
      <div *ngFor="let week of heatmap" class="week">
        <div *ngFor="let day of week"
          class="day border-secondary"
          [ngStyle]="{'background-color': getColor(day)}"
          (click)="onDayClick(day)"
          [attr.title]="formatDate(day)"
        ></div>
      </div>
    </div>
  `,
  styleUrl: './heatmap-selection.component.scss',
  imports: [CommonModule, FormsModule],
})
export class HeatmapSelectionComponent implements OnInit {
  @Input() timelines: HistoryTimeline[] = [];
  @Output() idSelected = new EventEmitter<string | undefined>();

  heatmap: Array<Array<HistoryTimeline | string>> = [];

  ngOnInit(): void {
    this.generateHeatmap();
  }

  generateHeatmap(): void {
    const weeks: Array<Array<HistoryTimeline | string>> = [];
    const daysInWeek = 7;
    const year = new Date().getUTCFullYear();
    const janFirst = new Date(Date.UTC(year, 0, 1));

    let currentDate = janFirst;
    let currentWeek: Array<HistoryTimeline | string> = [];

    // Pre-fill the first week with empty slots before Jan 1
    let dayOfWeek = janFirst.getUTCDay(); // Get the day of the week of Jan 1 (Monday = 1)
    for (let i = 0; i < dayOfWeek; i++) {
      currentWeek[i] = ''; // Fill with empty slots until Jan 1st
    }

    // Loop through all days in the year, accounting for leap years
    while (currentDate.getUTCFullYear() === year) {
      const dayOfWeek = currentDate.getUTCDay(); // Get day of the week (Sunday = 0, Monday = 1, etc.)

      // Add the current day as a string to the week
      currentWeek[dayOfWeek] = currentDate.toDateString();

      // If it's the end of the week, push the current week to the weeks array and start a new week
      if (dayOfWeek === 6) {
        weeks.push(currentWeek);
        currentWeek = [];
      }

      // Move to the next day
      currentDate = new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), currentDate.getUTCDate() + 1));
    }

    // Push the last week if it wasn't completed (i.e., the last days of the year)
    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }

    // Populate the heatmap with actual timeline data
    this.timelines.forEach((timeline) => {
      const date = new Date(timeline.time);
      const weekOfYear = this.getWeekOfYear(date); // Get the week of the year
      const dayOfWeek = date.getUTCDay(); // Sunday = 0, Monday = 1, etc.

      if (weekOfYear < weeks.length) { // Ensure we don't exceed array bounds
        weeks[weekOfYear][dayOfWeek] = timeline;
      }
    });

    console.log(weeks);
    this.heatmap = weeks;
  }

  getWeekOfYear(date: Date): number {
    const startOfYear = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    const dayOfYear = ((date.getTime() - startOfYear.getTime()) / 86400000) + startOfYear.getUTCDay();
    return Math.floor(dayOfYear / 7);
  }

  getColor(averageViewers: HistoryTimeline | string): string {
    if (typeof averageViewers === 'string' || averageViewers === undefined || averageViewers === null || (averageViewers as HistoryTimeline).averageViewers === 0) {
      return `rgb(28, 28, 28)`;  // Default dark color for no viewers or invalid input
    }
    // Define min and max viewers for scaling
    const minViewers = 0;
    const maxViewers = this.timelines.reduce((max, timeline) => Math.max(max, timeline.peakViewers), 0);

    // Calculate the color intensity based on the number of viewers
    const intensity = ((averageViewers as HistoryTimeline).averageViewers - minViewers) / (maxViewers - minViewers);
    const greenIntensity = Math.floor(intensity * 255);

    return `rgba(28, ${greenIntensity}, 28, .8)`;  // Green color scaling with intensity
  }

  onDayClick(day: HistoryTimeline | string): void {
    if (typeof day === 'string') {
      return;
    }

    this.idSelected.emit((day as HistoryTimeline).id);
  }

  formatDate(value: HistoryTimeline | String): string {
    if (typeof value === 'string') {
      return new Date(value as string).toDateString();
    }

    const timeLine = (value as HistoryTimeline);
    return new Date(timeLine.time).toDateString() + '\n' + timeLine.averageViewers + ' viewers';
  }
}
