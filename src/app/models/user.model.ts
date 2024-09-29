import { EmoteUsage } from "./emote.model";
import { SentimentAnalysis } from "./sentiment.model";
import { SubscriptionStatistic } from "./subscription-model";

export interface UserData {
    AverageMessageLength: number;
    EmoteUsage: EmoteUsage[];
    HostEvents: number;
    LinksShared: number;
    MessageIntervalMs: number;
    PeakActivityPeriods: { [key: string]: number };
    RaidEvents: number;
    SentenceFrequency: { [key: string]: number };
    SentimentAnalysis: SentimentAnalysis;
    SubscriptionStatistic: SubscriptionStatistic;
    TopChatters: { [key: string]: number };
    TotalBans: TotalBans;
    TotalMessages: number;
    TotalTimeouts: TotalTimeouts;
    TotalUsers: number;
    UniqueWords: number;
    WordFrequency: { [key: string]: number };
  }
  
  export interface TotalBans {
    totalBans: number;
    banReasons: any[];
  }
  
  export interface TotalTimeouts {
    totalTimeouts: number;
    totalTimeoutDuration: number;
    averageTimeoutDuration: number;
    timeoutReasons: any[];
  }