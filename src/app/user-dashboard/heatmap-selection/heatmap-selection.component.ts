import { Component, AfterViewInit, OnDestroy, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HistoryTimeline } from '../../models/historical.model';
import { MatDialog } from '@angular/material/dialog';
import { DayEntryDialogComponent } from './day-entry.dialog';
import { DataService } from '../../services/app-service/data.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-heatmap-selection',
  standalone: true,
  templateUrl: './heatmap-selection.component.html',
  styleUrls: ['./heatmap-selection.component.scss'],
  imports: [CommonModule, FormsModule],
})
export class HeatmapSelectionComponent implements OnDestroy, AfterViewInit {
  username: string = '';
  timelines: HistoryTimeline[] = [];
  isHistorySelected: boolean = false;
  subscriptions: Subscription = new Subscription();

  // Modify type to allow for arrays of HistoryTimeline
  heatmap: Array<Array<HistoryTimeline[] | string>> = [];
  daysOfWeek: string[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  months: string[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  selectedYear: number = new Date().getUTCFullYear();
  selectedDayEntries: HistoryTimeline[] = [];

  // Dragging variables
  isDragging: boolean = false;
  startX: number = 0;
  startY: number = 0;
  scrollLeft: number = 0;
  scrollTop: number = 0;

  constructor(private dialog: MatDialog, private dataService: DataService, private elRef: ElementRef) {
    this.username = dataService.getUserName();
    this.subscriptions.add(this.dataService.userName$.subscribe((username) => {
      this.username = username;
      this.getTimelines();
    }));
  }

  getTimelines(): void {
    this.dataService.getViewCountHistory(this.username).subscribe((timelines) => {
      this.timelines = timelines;
      this.generateHeatmap();
    });
  }

  ngAfterViewInit(): void {
    document.addEventListener('click', this.onDocumentClick.bind(this));

    const heatmapContainer = this.elRef.nativeElement.querySelector('.heatmap-container');

    // Listen for mouse down event to start dragging
    heatmapContainer.addEventListener('mousedown', (e: MouseEvent) => {
      this.isDragging = true;
      heatmapContainer.classList.add('dragging');
      this.startX = e.pageX - heatmapContainer.offsetLeft;
      this.startY = e.pageY - heatmapContainer.offsetTop;
      this.scrollLeft = heatmapContainer.scrollLeft;
      this.scrollTop = heatmapContainer.scrollTop;
    });

    // Listen for mouse up event to stop dragging
    window.addEventListener('mouseup', () => {
      this.isDragging = false;
      heatmapContainer.classList.remove('dragging');
    });

    // Listen for mouse move event to handle dragging
    heatmapContainer.addEventListener('mousemove', (e: MouseEvent) => {
      if (!this.isDragging) return; // Only scroll if dragging
      e.preventDefault();
      const x = e.pageX - heatmapContainer.offsetLeft;
      const y = e.pageY - heatmapContainer.offsetTop;
      const walkX = (x - this.startX) * 1; // Adjust scroll speed
      const walkY = (y - this.startY) * 1;
      heatmapContainer.scrollLeft = this.scrollLeft - walkX;
      heatmapContainer.scrollTop = this.scrollTop - walkY;
    });
  }

  ngOnDestroy(): void {
    document.removeEventListener('click', this.onDocumentClick.bind(this));
    this.subscriptions.unsubscribe();
    const heatmapContainer = this.elRef.nativeElement.querySelector('.heatmap-container');
    heatmapContainer.removeEventListener('mousedown', () => { });
    window.removeEventListener('mouseup', () => { });
    heatmapContainer.removeEventListener('mousemove', () => { });
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

    // Scroll to the current week or a specific week based on logic
    setTimeout(() => {
      const currentDate = new Date(); // Or some other logic to determine the target week
      const currentWeekIndex = this.getWeekOfYear(currentDate); // Determine the correct week index
      const weekElements = this.elRef.nativeElement.querySelectorAll('.week-number');
      if (weekElements[currentWeekIndex]) {
        weekElements[currentWeekIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 0);
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
        this.getHistoryDataById(day[0].id);
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

  getHistoryDataById(id: string) {
    this.dataService.getHistoryByKey(this.username, id).subscribe({
      next: (data) => {
        this.dataService.historicalDataSubject.next(data);
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  selectEntry(entry: HistoryTimeline): void {
    this.getHistoryDataById(entry.id);
    this.isHistorySelected = true;
    this.selectedDayEntries = [];
  }

  unselectHistory(): void {
    this.isHistorySelected = false;
    this.dataService.historicalDataSubject.next(undefined);
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
