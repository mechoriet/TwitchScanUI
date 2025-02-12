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

    @ViewChild('vodListModal', { static: true }) vodListModal!: ElementRef; // Get the modal element reference

    private modalInstance: Modal | null = null;

    constructor(private twitchVodService: TwitchVodService) { }

    // Method to open the modal and load VODs externally
    openModal(): void {
        if (!this.isLoaded) {
            this.loadVods();
        }
        // Initialize Bootstrap modal
        this.modalInstance = new Modal(this.vodListModal.nativeElement, {
            backdrop: 'static',
            keyboard: false
        });
        this.modalInstance.show(); // Show the modal programmatically
    }

    // Method to load VODs
    loadVods(): void {
        this.twitchVodService.getVodsFromChannel(this.username).subscribe({
            next: (response) => {
                this.vods = response.videos;
                this.isLoaded = true;  // Prevent multiple reloads
            },
            error: (err) => {
                console.error('Error fetching VODs:', err);
            }
        });
    }

    // Method to handle VOD selection and fetch chat messages
    selectVod(vod: Video): void {
        this.selectedVod = vod;
        this.isLoading = true;
        this.twitchVodService.getChatMessagesFromVod(this.username, vod.id, vod.createdAt, vod.viewCount).subscribe({
            next: (result) => {
                this.selectedVod = null; // Reset selected VOD
                this.isLoading = false;
                this.closeModal(); // Close modal after chat messages are loaded
                this.twitchVodService.vodsFetchedSubject.next(true);
            },
            error: (err) => {
                console.error('Error fetching chat messages:', err);
                this.closeModal(); // Close modal even if there's an error
            }
        });
    }

    // Method to close the modal
    closeModal(): void {
        if (this.modalInstance) {
            this.modalInstance.hide(); // Close the modal programmatically
        }
    }
}