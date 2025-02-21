import { Component, Input, ViewChild, ElementRef } from '@angular/core';
import { Video } from '../../../models/vod.model';
import { TwitchVodService } from '../../../services/twitch-service/twitch-vod.service';
import { CommonModule, DatePipe } from '@angular/common';
import { Modal } from 'bootstrap';
import { fadeInOut } from '../../../animations/general.animations';

@Component({
    standalone: true,
    selector: 'app-vod-list',
    templateUrl: './vod-list.component.html',
    imports: [CommonModule, DatePipe],
    animations: [
        fadeInOut
    ]
})
export class VodListComponent {
    @Input() username!: string;
    vods: Video[] = [];
    selectedVod: Video | null = null;
    isLoaded: boolean = false;
    isLoading: boolean = false;

    @ViewChild('vodListModal', { static: true }) vodListModal!: ElementRef;

    private modalInstance: Modal | null = null;

    constructor(private twitchVodService: TwitchVodService) { }

    openModal(): void {
        if (!this.isLoaded) {
            this.loadVods();
        }
        
        this.modalInstance = new Modal(this.vodListModal.nativeElement, {
            backdrop: 'static',
            keyboard: false
        });
        this.modalInstance.show();
    }

    loadVods(): void {
        this.twitchVodService.getVodsFromChannel(this.username).subscribe({
            next: (response) => {
                this.vods = response.videos;
                this.isLoaded = true;
            },
            error: (err) => {
                console.error('Error fetching VODs:', err);
            }
        });
    }

    selectVod(vod: Video): void {
        this.selectedVod = vod;
        this.isLoading = true;
        this.twitchVodService.getChatMessagesFromVod(this.username, vod.id, vod.createdAt, vod.viewCount).subscribe({
            next: (result) => {
                this.selectedVod = null;
                this.isLoading = false;
                this.closeModal();
                this.twitchVodService.vodsFetchedSubject.next(true);
            },
            error: (err) => {
                console.error('Error fetching chat messages:', err);
                this.closeModal();
            }
        });
    }

    closeModal(): void {
        if (this.modalInstance) {
            this.modalInstance.hide();
        }
    }
}