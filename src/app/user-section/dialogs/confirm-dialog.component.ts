import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  template: `
    <div mat-dialog-content class="bg-dark p-3 text-light rounded">
    <div class="modal-header">
      <h5 class="modal-title">
        <i class="fas fa-question-circle me-2"></i> Confirm
      </h5>
    </div>
    <div class="modal-body mb-3">
      <p>{{ data.message }}</p>
    </div>
    <div class="modal-footer justify-content-between">
      <button type="button" class="btn btn-primary" (click)="onYesClick()">
        <i class="fas fa-check me-1"></i> Yes
      </button>
      <button type="button" class="btn btn-secondary" (click)="onNoClick()">
        <i class="fas fa-times me-1"></i> No
      </button>
    </div>
    </div>
  `
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { message: string }
  ) {}

  onNoClick(): void {
    this.dialogRef.close(false);
  }

  onYesClick(): void {
    this.dialogRef.close(true);
  }
}
