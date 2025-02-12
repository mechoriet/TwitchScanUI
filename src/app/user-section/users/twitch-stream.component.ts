import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { twitchEmbedUrl } from '../../general/variables';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DataService } from '../../services/app-service/data.service';
import { Subscription } from 'rxjs';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { Settings, SettingsService } from '../../services/app-service/settings.service';

@Component({
  selector: 'app-twitch-stream',
  standalone: true,
  template: `
    <div
      class="twitch-modal"
      #modal
      cdkDrag
      (cdkDragEnded)="onDragEnd($event)"
    >
      <div cdkDragHandle class="modal-drag bg-transparent">
      </div>
      <iframe
        #twitchFrame
        [src]="twitchUrl"
        autoplay="false"
        frameborder="0"
        allowfullscreen="true"
        scrolling="no"
        class="twitch-iframe"
      ></iframe>
      <div
        class="resizer bg-transparent"
        (mousedown)="resize($event); $event.stopPropagation()"
        title="Resize"
      ></div>
    </div>
  `,
  styles: [
    `
      .twitch-modal {
        position: absolute;
        background: #2c2f33;
        border: 1px solid #000;
        z-index: 1000;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
        overflow: hidden;
      }

      .twitch-iframe {
        width: 100%;
        height: 100%;
      }

      .resizer {
        width: 10px;
        height: 10px;
        position: absolute;
        right: 0;
        bottom: 0;
        cursor: se-resize;
      }

      .modal-drag {
        width: 100%;
        height: 40px;
        cursor: move;
        position: absolute;
        top: 0;
        left: 0;
        color: white;
        padding: 5px;
        transition: background-color 0.2s;
      }

      .modal-drag:hover {
        background-image: linear-gradient(180deg, #000, transparent);
      }
    `,
  ],
  imports: [CommonModule, DragDropModule],
})
export class TwitchStreamComponent implements OnDestroy, OnInit, AfterViewInit {
  @ViewChild('twitchFrame') twitchFrame!: ElementRef;
  @ViewChild('modal') modal!: ElementRef;
  settings: Settings = new Settings();

  twitchUrl: SafeResourceUrl = '';
  subscriptions: Subscription = new Subscription();
  minWidth = 300;
  minHeight = 200;

  constructor(
    private sanitizer: DomSanitizer,
    private settingsService: SettingsService,
    public dataService: DataService
  ) {
    this.twitchUrl = this.getSafeTwitchUrl(dataService.getUserName());
    this.settings = this.settingsService.getSettings();
  }

  ngOnInit(): void {
    this.subscriptions.add(
      this.dataService.userName$.subscribe((username) => {
        this.twitchUrl = this.getSafeTwitchUrl(username);
      })
    );
    this.subscriptions.add(
      this.settingsService.settings$.subscribe((s) => {
        this.settings = s;
      })
    );
  }

  ngAfterViewInit(): void {
    this.setModalSize(this.settings.streamWidth, this.settings.streamHeight);
    this.setModalPosition(this.settings.streamPosition.x, this.settings.streamPosition.y);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  resize(event: MouseEvent) {
    const modalElement = this.modal.nativeElement;
    const startWidth = modalElement.clientWidth;
    const startHeight = modalElement.clientHeight;
    const startX = event.clientX;
    const startY = event.clientY;

    const onMouseMove = (e: MouseEvent) => {
      const newWidth = startWidth + (e.clientX - startX);
      const newHeight = startHeight + (e.clientY - startY);
      this.settings.streamWidth = newWidth > this.minWidth ? newWidth : this.minWidth;
      this.settings.streamHeight = newHeight > this.minHeight ? newHeight : this.minHeight;
      this.settingsService.setSettings(this.settings);
      this.setModalSize(this.settings.streamWidth, this.settings.streamHeight);
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }

  onDragEnd(event: any) {
    const modalElement = this.modal.nativeElement;
    const rect = modalElement.getBoundingClientRect();
  
    this.settings.streamPosition = {
      x: rect.left,
      y: rect.top,
    };
  
    this.settingsService.setSettings(this.settings);
  }

  setModalSize(width: number, height: number) {
    const modalElement = this.modal.nativeElement;
    modalElement.style.width = `${width}px`;
    modalElement.style.height = `${height}px`;
  }

  setModalPosition(x: number, y: number) {
    const modalElement = this.modal.nativeElement;
    modalElement.style.left = `${x}px`;
    modalElement.style.top = `${y}px`;
  }

  private getSafeTwitchUrl(channelName: string): SafeResourceUrl {
    const unsafeUrl = `https://player.twitch.tv/?channel=${channelName}&parent=${twitchEmbedUrl}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(unsafeUrl);
  }
}
