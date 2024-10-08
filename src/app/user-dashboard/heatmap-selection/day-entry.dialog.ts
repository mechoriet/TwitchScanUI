import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HistoryTimeline } from '../../models/historical.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-day-entry-dialog',
  standalone: true,
  template: `
    <div mat-dialog-content class="bg-glass">
      <ul class="list-group bg-glass">
        <li *ngFor="let entry of data.selectedDayEntries; let i = index" (click)="selectEntry(entry)" class="list-group-item pointer bg-glass border-secondary text-light">
            <span class="me-5">{{formatDate([entry])}}</span>
            <span class="badge bg-info text-dark me-1">Avg. {{ entry.averageViewers }}</span>
            <span class="badge bg-info text-dark">Peak {{ entry.peakViewers }}</span>
        </li>
      </ul>
    </div>
  `,
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

  formatDate(day: HistoryTimeline[]): string {
    const firstEntry = day[0];
    return new Date(firstEntry.time).toDateString();
  }
}
