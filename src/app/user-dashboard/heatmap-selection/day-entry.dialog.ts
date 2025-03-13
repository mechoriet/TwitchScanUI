// day-entry.dialog.ts
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HistoryTimeline } from '../../models/historical.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-day-entry-dialog',
  standalone: true,
  template: `
    <h5 mat-dialog-title class="text-light text-center">
      Streams on {{ formatDateFull(data.selectedDayEntries[0]) }}
    </h5>
    <div mat-dialog-content>
      <div class="list-group">
        <div *ngFor="let entry of data.selectedDayEntries; let i = index"
             (click)="selectEntry(entry)"
             class="list-group-item pointer border-secondary text-light mb-2 p-3 rounded stream-entry">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <div class="time">{{ formatTime(entry) }}</div>
                <div class="d-flex mt-2">
                  <span class="badge bg-info text-dark me-2">Avg. {{ entry.averageViewers }}</span>
                  <span class="badge bg-info text-dark">Peak {{ entry.peakViewers }}</span>
                </div>
              </div>
              <i class="fas fa-chevron-right"></i>
            </div>
        </div>
      </div>
    </div>
    <div mat-dialog-actions class="justify-content-end d-flex">
      <button mat-button (click)="onClose()" class="btn btn-outline-secondary">Cancel</button>
    </div>
  `,
  styles: [`
    .stream-entry {
      background-color: rgba(40, 44, 52, 0.8);
      transition: all 0.2s ease;
      cursor: pointer;
    }
    .stream-entry:hover {
      background-color: rgba(60, 64, 72, 0.8);
      transform: translateY(-2px);
    }
    .time {
      font-size: 1.1rem;
      font-weight: 500;
    }
  `],
  imports: [CommonModule],
})
export class DayEntryDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<DayEntryDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { selectedDayEntries: HistoryTimeline[] }
  ) {}

  selectEntry(entry: HistoryTimeline): void {
    this.dialogRef.close(entry);
  }

  onClose(): void {
    this.dialogRef.close();
  }

  formatDateFull(entry: HistoryTimeline): string {
    return new Date(entry.time).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatTime(entry: HistoryTimeline): string {
    return new Date(entry.time).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
