import { Component, OnInit, OnDestroy } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { DataService } from '../../services/app-service/data.service';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-thumbnail',
  standalone: true,
  template: `
    <div *ngIf="imageKeys.length > 0" class="text-center h-100 w-100 m-0">
      <div class="thumbnail">
        <img
          [src]="imageBlobMap.get(imageKeys[currentIndex])"
          alt="Live preview image"
          class="thumbnail-image"
        />
        <div class="overlay rounded position-absolute top-0 start-50 translate-middle-x mt-2">
          <span class="overlay-text">{{ formatDate(imageKeys[currentIndex]) }}</span>
        </div>
      </div>

      <div class="controls">
        <button (click)="previousImage()" [disabled]="currentIndex === 0" class="btn m-1" [ngClass]="{ 'btn-secondary': currentIndex > 0, 'btn-dark': currentIndex === 0 }">
          <i class="fa-solid fa-caret-left"></i>
        </button>
        <small class="text-light d-flex" style="align-items: center;">Thumbnail {{ currentIndex + 1 }} of {{ imageKeys.length }}</small>
        <button (click)="nextImage()" [disabled]="currentIndex === imageKeys.length - 1" class="btn m-1" [ngClass]="{ 'btn-secondary': currentIndex < imageKeys.length - 1, 'btn-dark': currentIndex === imageKeys.length - 1 }">
          <i class="fa-solid fa-caret-right"></i>
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .thumbnail {
        overflow: hidden;
        background-color: #000;
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;
        border: 1px solid #555;
        width: 100%;
        height: 300px; /* Set a fixed height for thumbnails */
      }

      .thumbnail-image {
        max-width: 100%;
        height: auto;
      }

      .controls {
        display: flex;
        justify-content: space-between;
      }

      .overlay-text {
        font-size: 10px;
        color: #fff;
      }
    `,
  ],
  imports: [CommonModule],
})
export class ThumbnailComponent implements OnInit, OnDestroy {
  username: string = '';
  imageBlobMap: Map<string, SafeUrl> = new Map();
  imageKeys: string[] = [];
  currentIndex: number = 0;
  private imagesToKeep: number = 15;
  private timeBetweenFetches: number = 5 * 60 * 1000;
  private lastFetchTime: number = 0;  // Use timestamp for optimization
  private subscriptions: Subscription = new Subscription();

  constructor(
    private dataService: DataService,
    public sanitizer: DomSanitizer
  ) {
    this.username = dataService.getUserName();
    this.subscriptions.add(this.dataService.userName$.subscribe((username) => {
      this.username = username;
    }));
  }

  ngOnInit(): void {
    // Fetch the initial image for the current user
    const url = this.dataService.getUserThumbnail(this.username);
    this.fetchAndSaveImage(url);

    // Subscribe to image URL updates and fetch images
    this.subscriptions.add(this.dataService.imageUrlSubject.subscribe((url: string) => {
      this.fetchAndSaveImage(url);
    }));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  fetchAndSaveImage(url: string): void {
    const currentTime = Date.now();
    if (currentTime - this.lastFetchTime < this.timeBetweenFetches) {
      return;  // Skip fetching if within the fetch interval
    }

    this.lastFetchTime = currentTime;
    fetch(url)
      .then(response => response.blob())
      .then(blob => {
        const timeString = new Date().toUTCString();
        const safeUrl = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(blob));

        // Add new image to the map and update the keys array
        this.imageBlobMap.set(timeString, safeUrl);
        this.imageKeys = Array.from(this.imageBlobMap.keys());

        if (this.imageBlobMap.size > this.imagesToKeep) {
          // Remove oldest image when exceeding the limit
          const firstKey = this.imageKeys.shift()!;
          this.imageBlobMap.delete(firstKey);
        }

        // Update the index to point to the most recent image
        this.currentIndex = this.imageKeys.length - 1;
      })
      .catch(error => console.error('Error fetching the image:', error));
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  nextImage(): void {
    if (this.currentIndex < this.imageKeys.length - 1) {
      this.currentIndex++;
    }
  }

  previousImage(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    }
  }
}
