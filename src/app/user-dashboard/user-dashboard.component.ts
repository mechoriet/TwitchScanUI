import { Component, OnInit, OnDestroy } from '@angular/core';
import { InitiatedChannel } from '../models/user.model';
import { DataService } from '../services/app-service/data.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { getTimeSince } from '../helper/date.helper';
import { moveAnimation, listAnimation, fadeInOut, fadeOut, fadeIn, messageAnimation } from '../animations/general.animations';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { NumberAbbreviatorPipe } from '../pipes/number-abbreviator.pipe';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { getMessagesPerMinute } from '../helper/custom-calc.helper';
import { ViewPortService } from '../helper/view-port.service';
import { TwitchAuthService } from '../services/twitch-service/twitch-auth.service';
import { TwitchLogin } from '../models/twitch.login.model';
import { version, websiteEnding, websiteName } from '../general/variables';

@Component({
    selector: 'app-user-dashboard',
    standalone: true,
    templateUrl: './user-dashboard.component.html',
    styleUrls: ['./user-dashboard.component.scss'],
    imports: [
        CommonModule,
        FormsModule,
        DragDropModule,
        NumberAbbreviatorPipe,
        RouterModule
    ],
    animations: [
        moveAnimation,
        listAnimation,
        fadeOut,
        fadeInOut,
        fadeIn,
        messageAnimation
    ]
})
export class UserDashboardComponent implements OnInit, OnDestroy {
    initiatedChannels: InitiatedChannel[] = [];
    loading: boolean = false;
    notDismissed: boolean = true;
    username: string = '';
    info: string = '';
    userAccount: TwitchLogin | undefined;
    websiteName = websiteName;
    websiteEnding = websiteEnding;
    private subscriptions: Subscription[] = [];

    version = version;

    getMessagesPerMinute = getMessagesPerMinute;
    getTimeSince = getTimeSince;

    constructor(private router: Router, private dataService: DataService, public viewportService: ViewPortService, public twitchAuthService: TwitchAuthService) {
    }

    saveDismissed(): void {
        this.notDismissed = false;
        localStorage.setItem(version + 'dismissed', 'true');
    }

    ngOnInit(): void {
        if (localStorage.getItem(version + 'dismissed')) {
            this.notDismissed = false;
        }
        this.loading = true;

        const userAccountSubscription = this.twitchAuthService.userAccount$.subscribe({
            next: (account) => {
                this.userAccount = account;
            },
            error: (err) => {
                console.error(err);
            }
        });

        const signalRConnectionSubscription = this.dataService.connectionEstablished.subscribe({
            next: (connected) => {
                if (connected) {
                    this.initiate();
                    this.dataService.joinChannel("public");
                }
            },
            error: (err) => {
                console.error(err);
            }
        });

        const onlineStatusSubscription = this.dataService.onlineStatusSubject.subscribe({
            next: (status) => {
                this.updateChannelStatus(status);
            },
            error: (err) => {
                console.error(err);
            }
        });

        const messageCountSubscription = this.dataService.messageCountSubject.subscribe({
            next: (messageCount) => {
                this.updateMessageCount(messageCount);
                this.sortInitiatedChannels();
            },
            error: (err) => {
                console.error(err);
            }
        });

        this.subscriptions.push(userAccountSubscription, signalRConnectionSubscription, onlineStatusSubscription, messageCountSubscription);
    }

    initiate() {
        this.fetchInitiatedChannels();
    }

    logout(): void {
        this.twitchAuthService.logout().then(() => {
            this.fetchInitiatedChannels();
        });
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach(sub => sub.unsubscribe());
        this.dataService.leaveChannel("public");
    }

    sortInitiatedChannels(): void {
        this.initiatedChannels = this.initiatedChannels.sort((a, b) => {
            if (a.isOnline && !b.isOnline) return -1;
            if (!a.isOnline && b.isOnline) return 1;
            return b.messageCount - a.messageCount;
        });
    }

    fetchInitiatedChannels(): void {
        this.loading = true;
        const initiatedChannelsSubscription = this.dataService.getInitiatedChannels().subscribe({
            next: (data) => {
                this.initiatedChannels = data;
                this.sortInitiatedChannels();
                this.loading = false;
            },
            error: (err) => {
                console.error(err);
                this.loading = false;
            }
        });
        this.subscriptions.push(initiatedChannelsSubscription);
    }

    fetchNewData(): void {
        if (this.username.trim().length === 0) {
            this.info = 'Please enter a valid Twitch channel username.';
            return;
        } else if (this.username.includes('twitch.tv/')) {
            this.username = this.username.split('/').pop() || '';
        }

        this.info = '';
        this.loading = true;
        this.dataService.setUserName(this.username);
        this.router.navigate(['c', this.username]);
    }

    filteredChannels(): InitiatedChannel[] {
        if (!this.username) return this.initiatedChannels;
        return this.initiatedChannels.filter(channel =>
            (channel.title + channel.game + channel.channelName).toLowerCase().includes(this.username.toLowerCase())
        );
    }

    trackByChannelId(index: number, item: InitiatedChannel): string {
        return item.channelName;
    }

    updateChannelStatus(status: any): void {
        this.initiatedChannels.forEach(channel => {
            if (channel.channelName === status.channelName) {
                channel.isOnline = status.isOnline;
                channel.messageCount = status.messageCount;
                channel.viewerCount = status.viewerCount;
                channel.uptime = status.uptime;
            }
        });
    }

    updateMessageCount(data: any): void {
        this.initiatedChannels.forEach(channel => {
            if (channel.channelName === data.channelName) {
                channel.messageCount = data.messageCount;
            }
        });
    }
}
