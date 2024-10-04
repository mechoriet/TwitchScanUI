import { EmoteUsage } from "./emote.model";
import { SentimentAnalysis } from "./sentiment.model";
import { SubscriptionStatistic } from "./subscription-model";

export class InitiatedChannel {
  channelName: string;
  messageCount: number;
  createdAt: string;
  isOnline: boolean;
  historyLength: number;

  constructor(channelName: string) {
    this.channelName = channelName;
    this.messageCount = 0;
    this.createdAt = new Date().toISOString();
    this.isOnline = false;
    this.historyLength = 0;
  }
}

export interface ChannelStatus {
  channelName: string;
  isOnline: boolean;
  messageCount: number;
}

export interface ChannelMessageCount {
  channelName: string;
  messageCount: number;
}

export interface ChannelMetrics {
  viewerStatistics: ViewerStatistics;
  currentGame: string;
  uptime: string;
  viewersOverTime: { [key: string]: number };
}

export interface ViewerStatistics {
  currentViewers: number;
  averageViewers: number;
  peakViewers: number;
}

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
  ChannelMetrics: ChannelMetrics;
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