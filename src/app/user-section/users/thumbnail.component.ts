import { Component, OnInit, Input } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { DataService } from '../../services/app-service/data.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-thumbnail',
  standalone: true,
  template: `
    <div
      *ngIf="imageBlobMap.size > 0"
      class="card border-secondary bg-dark text-light text-center"
    >
      <div class="thumbnails-container">
        <div *ngFor="let image of imageBlobMap | keyvalue" class="thumbnail">
          <img
            [src]="image.value"
            alt="Live preview image"
            class="thumbnail-image"
          />
          <div class="overlay">
            <span class="overlay-text">{{ formatDate(image.key) }}</span>
          </div>
        </div>
        <i class="fa-solid fa-images thumbnail-icon position-absolute top-50 start-50 translate-middle"></i>
      </div>
    </div>
  `,
  styles: [
    `
      .thumbnails-container {
        display: flex;
        justify-content: flex-end;
        gap: 5px;
        padding: 5px;
        background: linear-gradient(
          90deg,
          rgb(30, 32, 37),
          rgb(24, 26, 30),
        );
        border: 1px solid #444;
        border-radius: 5px;
        overflow-x: auto; 
        white-space: nowrap;
        scrollbar-width: thin;
      }

      .thumbnail {
        width: 220px;
        min-width: 220px;
        overflow: hidden;
        background-color: #000;
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;
        border: 2px solid #555;
      }

      .thumbnail-image {
        width: 100%;
        height: auto;
      }

      .thumbnail-icon {
        font-size: 64px;
        color: rgba(255, 255, 255, 0.7);
        z-index: 2;
      }

      .overlay {
        position: absolute;
        bottom: 4px;
        right: 4px;
        background-color: rgba(0, 0, 0, 0.6);
        padding: 2px 5px;
        border-radius: 3px;
      }

      .overlay-text {
        font-size: 10px;
        color: #fff;
      }
    `,
  ],
  imports: [CommonModule],
})
export class ThumbnailComponent implements OnInit {
  @Input({ required: true }) username: string = '';

  imageBlobMap: Map<string, SafeUrl> = new Map();
  private imagesToKeep: number = 15;
  private timeBetweenFetches: number = 5 * 60 * 1000;
  private lastFetchTime: Date = new Date(0);
  constructor(
    private dataService: DataService,
    public sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    // Fetch the image for the current user
    const url = this.dataService.getUserThumbnail(this.username);
    this.fetchAndSaveImage(url);

    // Subscribe to image URL updates and fetch images
    this.dataService.imageUrlSubject.subscribe((url: string) => {
      this.fetchAndSaveImage(url);
    });
  }

  getSantizedImageUrl(image: Blob): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(image));
  }

  fetchAndSaveImage(url: string): void {
    fetch(url)
      .then((response) => response.blob())
      .then((blob) => {
        // Check if the image was fetched within the last 5 minutes
        const currentTime = new Date();
        if (currentTime.getTime() - this.lastFetchTime.getTime() < this.timeBetweenFetches) {
          return;
        }
        this.lastFetchTime = currentTime;

        var timeString = new Date().toUTCString();
        this.imageBlobMap.set(timeString, this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(blob)));
        if (this.imageBlobMap.size > this.imagesToKeep) {
          this.imageBlobMap.delete(this.imageBlobMap.keys().next().value ?? '');
        }
      })
      .catch((error) => {
        console.error('Error fetching the image:', error);
      });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    var hours = date.getUTCHours().toString().padStart(2, '0');
    var minutes = date.getUTCMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }
}
