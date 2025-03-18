import { Component, Input, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatHistory, Emote } from '../../../models/chat-message.model';
import { DataService } from '../../../services/app-service/data.service';
import { openStream } from '../../../helper/general.helper';
import { Modal } from 'bootstrap';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-chat-history',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div #historyModal class="modal fade" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content bg-glass text-light p-2">
                <h5 class="text-center text-warning pointer" (click)="openStream(username)">Chat History for {{ username }}</h5>
                <div *ngIf="loading" class="text-center text-warning">
                    <i class="fas fa-spinner fa-spin"></i> Loading chat history...
                </div>

                <div *ngIf="chatHistory.length === 0&&!loading" class="text-center no-history">
                    No chat history found for this user.
                </div>
                <div *ngIf="chatHistory.length > 0&&!loading" class="history-list bg-dark rounded p-3" style="max-height: 75vh; overflow-y: auto;">
                    <div *ngFor="let history of chatHistory" class="history-item">
                        <div class="history-messages">
                            <div *ngFor="let message of history.messages" class="message">
                                <small class="message-timestamp text-muted me-1">{{ message.time | date:'short' }}</small>
                                <strong class="pointer me-1" (click)="openStream(history.username)" [style.color]="message.chatMessage.colorHex">{{ message.chatMessage.username }}:</strong>
                                <span [innerHTML]="replaceEmotes(message.chatMessage.message, message.chatMessage.emotes)"></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,
})
export class ChatHistoryComponent implements OnInit, AfterViewInit, OnDestroy {
    @Input() channelName!: string;
    @Input() username!: string;
    loading = true;

    @ViewChild('historyModal', { static: true }) historyModalElement!: ElementRef;

    chatHistory: ChatHistory[] = [];
    subscriptions = new Subscription();
    private historyModal!: Modal;

    openStream = openStream;

    constructor(private dataService: DataService) { }

    ngOnInit(): void {
        if (this.channelName && this.username) {
            this.fetchChatHistory();
        }

        this.subscriptions.add(
            this.dataService.chatHistorySubject.subscribe({
                next: (data) => {
                    this.chatHistory = [];
                    this.username = data;
                    this.fetchChatHistory();
                    this.historyModal.show();
                }
            }));
    }

    ngAfterViewInit(): void {
        // Initialize the Bootstrap modal here, after the view is fully initialized
        this.historyModal = new Modal(this.historyModalElement.nativeElement);
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    private fetchChatHistory(): void {
        this.loading = true;
        this.dataService.getChatHistory(this.channelName, this.username)
            .subscribe({
                next: (data: ChatHistory[]) => {
                    this.chatHistory = data;
                    this.loading = false;
                },
                error: (err) => {
                    console.error('Error fetching chat history:', err);
                    this.loading = false;
                }
            });
    }

    replaceEmotes(message: string, emotes: Emote[]): string {
        if (!emotes || emotes.length === 0) {
            return message;
        }

        let formattedMessage = '';
        let lastIndex = 0;

        emotes.sort((a, b) => a.startIndex - b.startIndex);

        emotes.forEach(emote => {
            if (lastIndex < emote.startIndex) {
                formattedMessage += this.escapeHtml(message.substring(lastIndex, emote.startIndex));
            }

            formattedMessage += `<img src="${emote.imageUrl}" alt="${emote.name}" title="${emote.name}" class="emote">`;

            lastIndex = emote.endIndex + 1;
        });

        if (lastIndex < message.length) {
            formattedMessage += this.escapeHtml(message.substring(lastIndex));
        }

        return formattedMessage;
    }

    private escapeHtml(unsafe: string): string {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}
