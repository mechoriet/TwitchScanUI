import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-raid-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="raid-list-container">
      <button class="btn btn-sm btn-outline-secondary mb-1" (click)="toggleRaidList()">
        <i class="fa-solid fa-user-plus me-1"></i>
        Raids ({{ raids.length }})
        <i class="fa-solid" [ngClass]="isExpanded ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
      </button>
      
      <div class="raid-panel" *ngIf="isExpanded">
        <div class="raid-panel-content">
          <div *ngFor="let raid of sortedRaids; trackBy: trackByFn"
               (click)="openChat(raid.value)"
               class="raid-item pointer"
               [ngStyle]="{ 'border-left-color': getColorByKey(raid.value) }">
            <div class="raid-name">{{ raid.value }}</div>
            <div class="raid-time">{{ getFormattedDateSince(raid.key) }}</div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .raid-list-container {
      text-align: left;
      margin-top: 8px;
      height: 100%;
    }
    .raid-panel {
      max-height: 80%;
      overflow-y: auto;
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 4px;
      margin-bottom: 8px;
    }
    .raid-panel-content {
      padding: 4px;
    }
    .raid-item {
      display: flex;
      align-items: center;
      padding: 4px 8px;
      margin-bottom: 2px;
      background-color: rgba(0,0,0,0.2);
      border-left: 3px solid #ccc;
      border-radius: 2px;
      font-size: 12px;
    }
    .raid-item:hover {
      background-color: rgba(0,0,0,0.4);
    }
    .raid-name {
      font-weight: bold;
      margin-right: 8px;
    }
    .raid-time {
      color: rgba(255,255,255,0.6);
      margin-left: auto;
      margin-right: 8px;
    }
    .raid-viewers {
      white-space: nowrap;
      color: rgba(255,255,255,0.8);
    }
  `]
})
export class RaidListComponent implements OnChanges {
  @Input() raids: { key: string; value: string }[] = [];
  @Input() colorMap: { [key: string]: string } = {};
  @Input() openChatFn: (user: string) => void = () => {};
  @Input() getFormattedDateSince: (date: string) => string = () => '';
  @Input() toggleRaidsFn: (isExpanded: boolean) => void = () => {};
  
  isExpanded = false;
  sortedRaids: { key: string; value: string }[] = [];
  
  ngOnChanges(): void {
    // Sort raids by time, newest first
    this.sortedRaids = [...this.raids].sort((a, b) => 
      new Date(b.key).getTime() - new Date(a.key).getTime()
    );
  }
  
  toggleRaidList(): void {
    this.isExpanded = !this.isExpanded;
    this.toggleRaidsFn(this.isExpanded);
  }
  
  openChat(user: string): void {
    this.openChatFn(user);
  }
  
  getColorByKey(key: string): string {
    return this.colorMap[key] || '#A2A2A2';
  }
  
  trackByFn(index: number, item: any): string {
    return item.key;
  }
}