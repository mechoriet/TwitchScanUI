import { Injectable } from '@angular/core';
import { UserProfile } from '../../models/user-profile.model';
import { GridsterItem } from 'angular-gridster2';
import { ComponentType } from './user-component.service';

@Injectable({
    providedIn: 'root'
})
export class ProfileService {
    private readonly STORAGE_KEY = 'userProfiles';

    // Retrieve user profiles, default to predefined ones if no profiles exist
    getProfiles(): UserProfile[] {
        const profiles = localStorage.getItem(this.STORAGE_KEY);
        return profiles ? JSON.parse(profiles) : this.getDefaultProfiles();
    }

    // Save a profile
    saveProfile(profile: UserProfile): void {
        const profiles = this.getProfiles();
        const index = profiles.findIndex(p => p.name === profile.name);
        if (index !== -1) {
            profiles[index] = profile;
        } else {
            profiles.push(profile);
        }
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(profiles));
    }

    // Delete a profile
    deleteProfile(profileName: string): void {
        const profiles = this.getProfiles().filter(p => p.name !== profileName);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(profiles));
    }

    // Default profiles for Subscription Template and Chat Template
    getDefaultProfiles(): UserProfile[] {
        return [
            {
                name: 'Default',
                layout: this.getDefaultLayout()
            },
            {
                name: 'Subscriptions',
                layout: this.getSubscriptionTemplateLayout()
            },
            {
                name: 'Chat',
                layout: this.getChatTemplateLayout()
            },
            {
                name: 'Viewer Metrics',
                layout: this.getViewerMetricsTemplateLayout()
            },
            {
                name: 'Content Creators',
                layout: this.getContentCreatorsTemplateLayout()
            },
            {
                name: 'Sentiment Tracker',
                layout: this.getSentimentTrackerTemplateLayout()
            },
            {
                name: 'Complete',
                layout: this.getCompleteLayout()
            }
        ];
    }

    getDefaultProfileByName(name: string): UserProfile {
        return this.getDefaultProfiles().find(p => p.name === name) || { name: 'Complete', layout: this.getCompleteLayout() };
    }

    // Default layout (could be your general dashboard setup)
    getDefaultLayout(): Array<GridsterItem & { type: ComponentType }> {
        return [
            { cols: 2, rows: 1, y: 0, x: 0, type: ComponentType.SentimentOverTime },
            { cols: 1, rows: 1, y: 1, x: 0, type: ComponentType.MessagesOverTime },
            { cols: 1, rows: 1, y: 1, x: 1, type: ComponentType.ViewersOverTime },
            { cols: 2, rows: 1, y: 2, x: 0, type: ComponentType.SubscriptionsOverTime },
        ];
    }

    // Subscription-specific layout
    getSubscriptionTemplateLayout(): Array<GridsterItem & { type: ComponentType }> {
        return [
            { cols: 2, rows: 1, y: 0, x: 0, type: ComponentType.SubscriptionsOverTime },
            { cols: 1, rows: 1, y: 1, x: 0, type: ComponentType.TopSubscribers },
            { cols: 1, rows: 1, y: 1, x: 1, type: ComponentType.SubscriptionSummary }
        ];
    }

    // Chat-specific layout
    getChatTemplateLayout(): Array<GridsterItem & { type: ComponentType }> {
        return [
            { cols: 1, rows: 2, y: 0, x: 0, type: ComponentType.TwitchChat },
            { cols: 2, rows: 1, y: 0, x: 1, type: ComponentType.EmoteUsage },
            { cols: 2, rows: 1, y: 1, x: 1, type: ComponentType.MessagesOverTime }
        ];
    }

    // Viewer metrics layout
    getViewerMetricsTemplateLayout(): Array<GridsterItem & { type: ComponentType }> {
        return [
            { cols: 2, rows: 1, y: 0, x: 0, type: ComponentType.ViewersOverTime },
            { cols: 1, rows: 1, y: 1, x: 0, type: ComponentType.TopChatter },
            { cols: 1, rows: 1, y: 1, x: 1, type: ComponentType.MessagesOverTime }
        ];
    }
    
    // Content creator layout
    getContentCreatorsTemplateLayout(): Array<GridsterItem & { type: ComponentType }> {
        return [
            { cols: 1, rows: 1, y: 0, x: 0, type: ComponentType.Thumbnails },
            { cols: 2, rows: 1, y: 0, x: 1, type: ComponentType.SubscriptionsOverTime },
            { cols: 1, rows: 1, y: 1, x: 0, type: ComponentType.ChannelInfo },
            { cols: 1, rows: 1, y: 2, x: 0, type: ComponentType.TopSubscribers },
            { cols: 2, rows: 2, y: 1, x: 1, type: ComponentType.SubscriptionSummary },
        ];
    }

    // Sentiment analysis layout
    getSentimentTrackerTemplateLayout(): Array<GridsterItem & { type: ComponentType }> {
        return [
            { cols: 2, rows: 1, y: 0, x: 0, type: ComponentType.SentimentOverTime },
            { cols: 2, rows: 1, y: 1, x: 0, type: ComponentType.SentimentAnalysis },
        ];
    }    

    // Complete layout
    getCompleteLayout(): Array<GridsterItem & { type: ComponentType }> {
        return [
            { cols: 2, rows: 1, y: 3, x: 1, type: ComponentType.SentimentAnalysis },
            { cols: 2, rows: 1, y: 2, x: 3, type: ComponentType.SentimentOverTime },
            { cols: 2, rows: 1, y: 3, x: 3, type: ComponentType.MessagesOverTime },
            { cols: 2, rows: 1, y: 0, x: 3, type: ComponentType.ViewersOverTime },
            { cols: 2, rows: 1, y: 1, x: 3, type: ComponentType.SubscriptionsOverTime },
            { cols: 1, rows: 1, y: 1, x: 1, type: ComponentType.TopSubscribers },
            { cols: 1, rows: 1, y: 1, x: 2, type: ComponentType.SubscriptionSummary },
            { cols: 2, rows: 1, y: 2, x: 1, type: ComponentType.TopChatter },
            { cols: 1, rows: 2, y: 2, x: 0, type: ComponentType.TwitchChat },
            { cols: 1, rows: 1, y: 0, x: 0, type: ComponentType.Thumbnails },
            { cols: 1, rows: 1, y: 1, x: 0, type: ComponentType.ChannelInfo },
            { cols: 2, rows: 1, y: 0, x: 1, type: ComponentType.HeatmapSelection }
        ];
    }    

    // Load a profile by name
    loadProfile(name: string): UserProfile | undefined {
        return this.getProfiles().find(p => p.name === name);
    }

    // Clear all profiles
    clearProfiles(): void {
        localStorage.removeItem(this.STORAGE_KEY);
    }
}
