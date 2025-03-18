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
  calendarData: CalendarMonth[] = [];
  minViewers: number = 0;
  maxViewers: number = 0;

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
    if (!heatmapContainer) return;

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
    if (!heatmapContainer) return;
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
    const year = this.selectedYear;
  
    // Process timeline data into a map for quick lookup
    const timelineMap = new Map<string, HistoryTimeline[]>();
    this.timelines.forEach(timeline => {
      const date = new Date(timeline.time);
      if (date.getUTCFullYear() === year) {
        const dateKey = date.toISOString().split('T')[0];
        if (!timelineMap.has(dateKey)) {
          timelineMap.set(dateKey, []);
        }
        timelineMap.get(dateKey)!.push(timeline);
      }
    });

    this.minViewers = Math.min(...this.timelines.map(t => t.peakViewers));
    this.maxViewers = Math.max(...this.timelines.map(t => t.peakViewers));
  
    // Create a continuous grid of days for the entire year
    const startDate = new Date(Date.UTC(year, 0, 1));
    const endDate = new Date(Date.UTC(year, 11, 31));
    
    // Calculate start offset (what day of the week is Jan 1)
    const startDayOfWeek = startDate.getUTCDay();
    
    // Create array of all days in the year
    const allDays: CalendarDay[] = [];
    
    // Add empty cells for days before Jan 1
    for (let i = 0; i < startDayOfWeek; i++) {
      allDays.push({
        date: null,
        isFirstDayOfMonth: false,
        isLastDayOfMonth: false,
        entries: null
      });
    }
    
    // Add all days of the year
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const nextDay = new Date(currentDate);
      nextDay.setUTCDate(currentDate.getUTCDate() + 1);
      
      const month = currentDate.getUTCMonth();
      const date = currentDate.getUTCDate();
      
      // Check if it's first day of month
      const isFirstDayOfMonth = date === 1;
      
      // Check if it's last day of month
      const isLastDayOfMonth = nextDay.getUTCMonth() !== month;
      
      const dateKey = currentDate.toISOString().split('T')[0];
      
      allDays.push({
        date: new Date(currentDate),
        isFirstDayOfMonth: isFirstDayOfMonth,
        isLastDayOfMonth: isLastDayOfMonth,
        entries: timelineMap.has(dateKey) ? timelineMap.get(dateKey)! : null
      });
      
      currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }
    
    // Organize days into weeks
    const weeks: CalendarDay[][] = [];
    for (let i = 0; i < allDays.length; i += 7) {
      weeks.push(allDays.slice(i, i + 7));
    }
    
    // Create a continuous flow of months
    this.calendarData = [];
    let currentWeekIndex = 0;
    
    for (let month = 0; month < 12; month++) {
      // Find the week containing the first day of this month
      let firstWeekOfMonth = -1;
      let lastWeekOfMonth = -1;
      
      for (let w = 0; w < weeks.length; w++) {
        for (let d = 0; d < weeks[w].length; d++) {
          const day = weeks[w][d];
          if (day.date && day.date.getUTCMonth() === month) {
            if (firstWeekOfMonth === -1) {
              firstWeekOfMonth = w;
            }
            lastWeekOfMonth = w;
          }
        }
      }
      
      if (firstWeekOfMonth !== -1) {
        const calendarMonth: CalendarMonth = {
          startRow: firstWeekOfMonth + 2, // +2 for header rows
          endRow: lastWeekOfMonth + 3, // +3 for header rows and to make it exclusive
          weeks: weeks.slice(firstWeekOfMonth, lastWeekOfMonth + 1)
        };
        
        this.calendarData.push(calendarMonth);
      }
    }
  }

  getWeekOfYear(date: Date): number {
    const startOfYear = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    const dayOfYear = Math.floor((date.getTime() - startOfYear.getTime()) / 86400000) + startOfYear.getUTCDay();
    return Math.floor(dayOfYear / 7);
  }

  getColor(entries: HistoryTimeline[] | null): string {
    if (!entries || entries.length === 0) {
      return `rgb(32, 34, 37)`;
    }

    // Calculate average viewer count across all entries
    const averageViewers = entries.reduce((sum, entry) => sum + entry.averageViewers, 0) / entries.length;

    if (averageViewers === 0) {
      return `rgb(32, 34, 37)`;
    }

    const maxViewers = Math.max(...this.timelines.map(t => t.peakViewers));
    const intensity = Math.min(1, averageViewers / maxViewers);
    const greenIntensity = Math.floor(intensity * 255);

    return `rgba(32, ${greenIntensity}, 37, 0.8)`;
  }

  formatDateShort(date: Date | null): string {
    if (!date) return '';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  
  formatDate(day: HistoryTimeline[] | string): string {
    if (typeof day === 'string') {
      return new Date(day).toDateString();
    }
  
    if (Array.isArray(day) && day.length > 0) {
      const firstEntry = day[0];
      const firstDate = new Date(firstEntry.time).toDateString();
      const viewerInfo = day.length === 1
        ? `${firstEntry.averageViewers} viewers`
        : `${day.length} entries, top viewers: ${firstEntry.averageViewers}`;
  
      return `${firstDate}\n${viewerInfo}`;
    }
  
    return 'No data';
  }

  formatViewerInfo(entries: HistoryTimeline[] | null): string {
    if (!entries || entries.length === 0) return 'No data';

    if (entries.length === 1) {
      return `Avg: ${entries[0].averageViewers} · Peak: ${entries[0].peakViewers}`;
    } else {
      const totalAvg = entries.reduce((sum, entry) => sum + entry.averageViewers, 0) / entries.length;
      const maxPeak = Math.max(...entries.map(entry => entry.peakViewers));
      return `${entries.length} streams · Avg: ${Math.round(totalAvg)} · Peak: ${maxPeak}`;
    }
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
          data: { selectedDayEntries: day },
          panelClass: 'day-entry-dialog',
          hasBackdrop: false,
          autoFocus: true
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
}

interface CalendarDay {
  date: Date | null;
  isFirstDayOfMonth: boolean;
  isLastDayOfMonth: boolean;
  entries: HistoryTimeline[] | null;
}

interface CalendarMonth {
  startRow: number;
  endRow: number;
  weeks: CalendarDay[][];
}