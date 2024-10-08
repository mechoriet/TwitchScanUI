import { Component, OnInit, OnDestroy } from '@angular/core';
import { InitiatedChannel, UserData } from '../models/user.model';
import { DataService } from '../services/app-service/data.service';
import { UserSectionComponent } from '../user-section/user-section.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThumbnailComponent } from "../user-section/users/thumbnail.component";
import { HistoryTimeline } from '../models/historical.model';
import { HeatmapSelectionComponent } from './heatmap-selection/heatmap-selection.component';
import { getFormattedDateSince, getTimeSince } from '../helper/date.helper';
import { moveAnimation, listAnimation, fadeInOut, expandCollapse, fadeInOutSlow, fadeInOutFast, fadeOut, fadeIn } from './user-dashboard.animations';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { NumberAbbreviatorPipe } from '../pipes/number-abbreviator.pipe';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { getMessagesPerMinute } from '../helper/custom-calc.helper';
import { ResizeViewHelper } from '../helper/resize-view.helper';
import { TwitchAuthService } from '../services/twitch-service/twitch-auth.service';
import { TwitchLogin } from '../models/twitch.login.model';

@Component({
    selector: 'app-user-dashboard',
    standalone: true,
    templateUrl: './user-dashboard.component.html',
    styleUrls: ['./user-dashboard.component.scss'],
    imports: [
        UserSectionComponent,
        CommonModule,
        FormsModule,
        ThumbnailComponent,
        HeatmapSelectionComponent,
        DragDropModule,
        NumberAbbreviatorPipe,
        RouterModule
    ],
    animations: [
        moveAnimation,
        listAnimation,
        fadeOut,
        fadeInOut,
        expandCollapse,
        fadeInOutSlow,
        fadeInOutFast,
        fadeIn
    ]
})
export class UserDashboardComponent implements OnInit, OnDestroy {
    viewCountHistory: HistoryTimeline[] = [];
    initiatedChannels: InitiatedChannel[] = [];
    userData: UserData | undefined;
    loading: boolean = false;
    notDismissed: boolean = true;
    username: string = '';
    lastUsername: string = '';
    providedUsername: string | null = null;
    info: string = '';
    userAccount: TwitchLogin | undefined;

    private subscriptions: Subscription[] = [];

    getMessagesPerMinute = getMessagesPerMinute;
    getFormattedDateSince = getFormattedDateSince;
    getTimeSince = getTimeSince;

    constructor(private route: ActivatedRoute, private router: Router, private dataService: DataService, public viewportService: ResizeViewHelper, public twitchAuthService: TwitchAuthService) {
        this.subscriptions.push(
            this.route.paramMap.subscribe(params => {
                this.providedUsername = params.get('channel');
                if (this.dataService.connectionEstablished.getValue()) {
                    this.initiate();
                }
            })
        );
    }

    saveDismissed(): void {
        this.notDismissed = false;
        localStorage.setItem('dismissed', 'true');
    }

    ngOnInit(): void {
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
                }
            },
            error: (err) => {
                console.error(err);
            }
        });

        const userDataSubscription = this.dataService.userDataSubject.subscribe({
            next: (userData) => {
                // Only update if userData is not manually cleared
                if (this.userData !== undefined) {
                    this.userData = userData;
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

        this.subscriptions.push(userAccountSubscription, signalRConnectionSubscription, userDataSubscription, onlineStatusSubscription, messageCountSubscription);

        if (localStorage.getItem('dismissed')) {
            this.notDismissed = false;
        }
    }

    initiate() {
        if (this.providedUsername) {
            this.username = this.providedUsername;
            this.loading = true;
            this.fetchData();
        } else {
            this.fetchInitiatedChannels();
        }
    }

    logout(): void {
        this.twitchAuthService.logout().then(() => {
            this.fetchInitiatedChannels();
        });
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach(sub => sub.unsubscribe());
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
        this.lastUsername = this.username;
        this.loading = true;
        this.router.navigate(['c', this.username]);
    }

    fetchData(): void {
        const fetchDataSubscription = this.dataService.getUserData(this.username).subscribe({
            next: (data) => {
                if (!this.userData) {
                    this.lastUsername = this.username;
                    this.dataService.joinChannel(this.username);
                    this.fetchHistory();
                }
                this.userData = data;
                this.loading = false;
            },
            error: (err) => {
                this.loading = false;
                this.info = 'An error occurred while fetching data. Please try again later.';
                this.router.navigate(['']);
            }
        });
        this.subscriptions.push(fetchDataSubscription);
    }

    fetchHistory(): void {
        const historySubscription = this.dataService.getViewCountHistory(this.username).subscribe({
            next: (data) => {
                this.viewCountHistory = data;
            },
            error: (error) => {
                console.error(error);
            }
        });
        this.subscriptions.push(historySubscription);
    }

    onHistoryDateSelected(id: string | undefined): void {
        if (!id) {
            this.dataService.joinChannel(this.username);
            this.fetchData();
            return;
        }

        this.dataService.leaveChannel(this.username);
        this.dataService.getHistoryByKey(this.username, id).subscribe({
            next: (data) => {
                this.userData = data.statistics;
            },
            error: (err) => {
                this.info = 'An error occurred while fetching historical data. Please try again later.';
                console.error(err);
            }
        });
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

    isChannelOnline(username: string): boolean {
        return this.initiatedChannels.find(channel => channel.channelName === username)?.isOnline ?? false;
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

    reset(): void {
        this.dataService.leaveChannel(this.lastUsername);
        this.router.navigate(['']);
        this.fetchInitiatedChannels();
        this.userData = undefined; // Ensure userData is manually cleared
        this.viewCountHistory = [];
        this.username = '';
        this.info = '';
        this.loading = false;
    }
}
