import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
    imports: [FormsModule, CommonModule, MatFormFieldModule, MatInputModule],
    standalone: true,
    template: `
    <div mat-dialog-content class="bg-dark p-3 text-light rounded">
    <div class="modal-header">
      <h5 class="modal-title">
        <i class="fas fa-edit me-2"></i> {{ data.title }}
      </h5>
    </div>
    <div class="modal-body">
      <div class="mb-3">
        <label for="profileName" class="form-label">Profile Name</label>
        <input id="profileName" class="form-control bg-dark border-secondary text-light text-center" [(ngModel)]="profileName" />
      </div>
    </div>
    <div class="modal-footer justify-content-between">
      <button type="button" class="btn btn-primary" (click)="onSave()">
        <i class="fas fa-save me-1"></i> Save
      </button>
      <button type="button" class="btn btn-secondary me-2" (click)="onCancel()">
        <i class="fas fa-times me-1"></i> Cancel
      </button>
    </div>
    </div>
  `
})
export class ProfileNameDialogComponent {
    profileName: string;

    constructor(
        public dialogRef: MatDialogRef<ProfileNameDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { title: string, defaultValue: string }
    ) {
        this.profileName = data.defaultValue;
    }

    onCancel(): void {
        this.dialogRef.close();
    }

    onSave(): void {
        this.dialogRef.close(this.profileName);
    }
}
