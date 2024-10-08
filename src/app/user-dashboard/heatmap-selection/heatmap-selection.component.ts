import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectionStrategy, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HistoryTimeline } from '../../models/historical.model';
import { MatDialog } from '@angular/material/dialog';
import { DayEntryDialogComponent } from './day-entry.dialog';

@Component({
  selector: 'app-heatmap-selection',
  standalone: true,
  templateUrl: './heatmap-selection.component.html',
  styleUrls: ['./heatmap-selection.component.scss'],
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeatmapSelectionComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() timelines: HistoryTimeline[] = [];
  @Output() idSelected = new EventEmitter<string | undefined>();
  isHistorySelected: boolean = false;

  // Modify type to allow for arrays of HistoryTimeline
  heatmap: Array<Array<HistoryTimeline[] | string>> = [];
  daysOfWeek: string[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  selectedYear: number = new Date().getUTCFullYear();
  selectedDayEntries: HistoryTimeline[] = [];

  constructor(private dialog: MatDialog) {}

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
    const weeks: Array<Array<HistoryTimeline[] | string>> = [];
    const year = this.selectedYear;
    const janFirst = new Date(Date.UTC(year, 0, 1));
    const decLast = new Date(Date.UTC(year, 11, 31));

    let currentDate = new Date(janFirst);
    let currentWeek: Array<HistoryTimeline[] | string> = new Array(janFirst.getUTCDay()).fill('');

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
          if (!Array.isArray(weeks[weekOfYear][dayOfWeek])) {
            weeks[weekOfYear][dayOfWeek] = [];
          }
          (weeks[weekOfYear][dayOfWeek] as HistoryTimeline[]).push(timeline);
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

  getColor(day: HistoryTimeline[] | string): string {
    if (typeof day === 'string' || day === undefined || !day.length) {
      return `rgb(32, 34, 37)`;
    }

    const averageViewers = day[0].averageViewers;
    if (averageViewers === 0) {
      return `rgb(32, 34, 37)`;
    }

    const maxViewers = Math.max(...this.timelines.map(t => t.peakViewers));
    const intensity = (averageViewers - 0) / (maxViewers - 0);
    const greenIntensity = Math.floor(intensity * 255);

    return `rgba(32, ${greenIntensity}, 37, .8)`;
  }

  onDayClick(day: HistoryTimeline[] | string): void {
    if (typeof day !== 'string' && day.length) {
      if (day.length === 1) {
        this.idSelected.emit(day[0].id);
        this.isHistorySelected = true;
      } else {
        // Open the Angular Material dialog with the multiple entries
        const dialogRef = this.dialog.open(DayEntryDialogComponent, {
          width: '400px',
          data: { selectedDayEntries: day }
        });
  
        dialogRef.afterClosed().subscribe((result) => {
          if (result) {
            this.selectEntry(result);
          }
        });
      }
    }
  }  

  selectEntry(entry: HistoryTimeline): void {
    this.idSelected.emit(entry.id);
    this.isHistorySelected = true;
    this.selectedDayEntries = [];
  }

  unselectHistory(): void {
    this.isHistorySelected = false;
    this.idSelected.emit(undefined);
  }

  closeModal(): void {
    this.selectedDayEntries = [];
  }

  formatDate(day: HistoryTimeline[] | string): string {
    if (typeof day === 'string' || day === undefined) {
      return day ? new Date(day).toDateString() : 'Invalid Date';
    }
  
    if (Array.isArray(day) && day.length > 0) {
      // Explicitly tell TypeScript that day is HistoryTimeline[]
      const firstEntry = day[0];
      const firstDate = new Date(firstEntry.time).toDateString();
      const viewerInfo = day.length === 1 
        ? `${firstEntry.averageViewers} viewers`
        : `${day.length} entries, top viewers: ${firstEntry.averageViewers}`;
  
      return `${firstDate}\n${viewerInfo}`;
    }
  
    return 'No data';
  }
}
