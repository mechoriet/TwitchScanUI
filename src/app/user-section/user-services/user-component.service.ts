import { Injectable } from '@angular/core';
import { SentimentAnalysisComponent } from '../sentiment/sentiment-analysis.component';
import { ChannelInfoComponent } from '../users/channel-info.component';
import { MessagesOverTimeComponent } from '../users/activity.component';
import { SentimentOverTimeComponent } from '../sentiment/sentiment-over-time.component';
import { ThumbnailComponent } from '../users/thumbnail.component';
import { SubscriptionsOverTimeComponent } from '../users/subscriptions-over-time.component';
import { TopSubscriberComponent } from '../users/top-subscriber.component';
import { SubscriptionSummaryComponent } from '../users/subscription-summary.component';
import { TopChatterComponent } from '../users/top-chatter.component';
import { SentenceFrequencyComponent } from '../users/sentence-frequency.component';
import { ChatWindowComponent } from '../users/chat-window/chat-window.component';
import { EmoteUsageComponent } from '../message/emote-usage.component';
import { TopBitsComponent } from '../message/top-bits.component';
import { ViewerMetricComponent } from '../users/viewer-metric/viewer-metric.component';

export enum ComponentType {
    ChannelInfo = 'ChannelInfo',
    TwitchChat = 'TwitchChat',
    SentimentOverTime = 'SentimentOverTime',
    SentimentAnalysis = 'SentimentAnalysis',
    MessagesOverTime = 'MessagesOverTime',
    ViewersOverTime = 'ViewersOverTime',
    Thumbnails = 'Thumbnails',
    SubscriptionsOverTime = 'SubscriptionsOverTime',
    TopSubscribers = 'TopSubscribers',
    SubscriptionSummary = 'SubscriptionSummary',
    TopChatter = 'TopChatter',
    SentenceFrequency = 'SentenceFrequency',
    EmoteUsage = 'EmoteUsage',
    TopBitsCheered = 'TopBitsCheered',
    VodList = 'VodList',
}

export const COMPONENTS = [
    {
        name: 'Channel Info',
        type: ComponentType.ChannelInfo,
        icon: 'fa-solid fa-info-circle',
        component: ChannelInfoComponent
    },
    {
        name: 'Twitch Chat',
        type: ComponentType.TwitchChat,
        icon: 'fa-solid fa-comments',
        component: ChatWindowComponent
    },
    {
        name: 'Sentiment Over Time',
        type: ComponentType.SentimentOverTime,
        icon: 'fa-solid fa-chart-line',
        component: SentimentOverTimeComponent
    },
    {
        name: 'Sentiment Analysis',
        type: ComponentType.SentimentAnalysis,
        icon: 'fa-solid fa-magnifying-glass-chart',
        component: SentimentAnalysisComponent
    },
    {
        name: 'Messages Over Time',
        type: ComponentType.MessagesOverTime,
        icon: 'fa-solid fa-envelope-open-text',
        component: MessagesOverTimeComponent
    },
    {
        name: 'Viewers Over Time',
        type: ComponentType.ViewersOverTime,
        icon: 'fa-solid fa-eye',
        component: ViewerMetricComponent
    },
    {
        name: 'Thumbnails',
        type: ComponentType.Thumbnails,
        icon: 'fa-solid fa-images',
        component: ThumbnailComponent
    },
    {
        name: 'Contributions Over Time',
        type: ComponentType.SubscriptionsOverTime,
        icon: 'fa-solid fa-handshake',
        component: SubscriptionsOverTimeComponent
    },
    {
        name: 'Top Contributors',
        type: ComponentType.TopSubscribers,
        icon: 'fa-solid fa-crown',
        component: TopSubscriberComponent
    },
    {
        name: 'Subscription Summary',
        type: ComponentType.SubscriptionSummary,
        icon: 'fa-solid fa-chart-pie',
        component: SubscriptionSummaryComponent
    },
    {
        name: 'Top Chatter',
        type: ComponentType.TopChatter,
        icon: 'fa-solid fa-microphone',
        component: TopChatterComponent
    },
    {
        name: 'Sentence Frequency',
        type: ComponentType.SentenceFrequency,
        icon: 'fa-solid fa-font',
        component: SentenceFrequencyComponent
    },
    {
        name: 'Emote Usage',
        type: ComponentType.EmoteUsage,
        icon: 'fa-solid fa-smile',
        component: EmoteUsageComponent
    },
    {
        name: 'Top Bits Cheered',
        type: ComponentType.TopBitsCheered,
        icon: 'fa-solid fa-gem',
        component: TopBitsComponent
    }
];

@Injectable({
    providedIn: 'root'
})
export class UserComponentService {
}
