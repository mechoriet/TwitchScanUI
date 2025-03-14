import { Component, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { HeatmapSelectionComponent } from './heatmap-selection.component';

// This is a service to open the dialog, not the dialog itself
@Component({
  selector: 'app-heatmap-dialog-opener',
  standalone: true,
  template: ``, // Empty template, this is just a service wrapper
  imports: [CommonModule],
})
export class HeatmapDialogOpener {
  constructor(private dialog: MatDialog) {}

  openHeatmapDialog(): void {
    this.dialog.open(HeatmapDialog, {
      width: '90%',
      maxWidth: '1200px',
      panelClass: 'heatmap-dialog-container',
      disableClose: true
    });
  }
}

// This is the actual dialog component
@Component({
  selector: 'app-heatmap-dialog',
  standalone: true,
  template: `
    <h5 mat-dialog-title class="text-light text-center">
      <i class="fas fa-calendar"></i> Calendar
    </h5>
    <div mat-dialog-content>      
      <app-heatmap-selection></app-heatmap-selection>
    </div>
    <div mat-dialog-actions class="justify-content-end d-flex pt-2">
      <button mat-button (click)="onClose()" mat-dialog-close class="btn btn-outline-secondary">Close</button>
    </div>
  `,
  imports: [CommonModule, HeatmapSelectionComponent],
})
export class HeatmapDialog {
  constructor(
      private dialogRef: MatDialogRef<HeatmapDialog>) {}

  onClose(): void {
    this.dialogRef.close();
  }
}