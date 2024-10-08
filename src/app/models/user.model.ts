import { EmoteUsage } from "./emote.model";
import { SentimentAnalysis } from "./sentiment.model";
import { SubscriptionStatistic } from "./subscription-model";

export enum Trend {
  Increasing,
  Decreasing,
  Stable
}
export class InitiatedChannel {
  channelName: string;
  title: string;
  game: string;
  messageCount: number;
  viewerCount: number;
  createdAt: string;
  streamingSince: string;
  isOnline: boolean;
  uptime: string | undefined;

  constructor(channelName: string) {
    this.channelName = channelName;
    this.title = "";
    this.game = "";
    this.messageCount = 0;
    this.viewerCount = 0;
    this.createdAt = new Date().toISOString();
    this.streamingSince = new Date().toISOString();
    this.isOnline = false;
  }
}

export interface ChannelStatus {
  channelName: string;
  isOnline: boolean;
  messageCount: number;
  viewerCount: number;
  uptime: string | undefined;
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
  totalWatchTime: number;
  trend: Trend;
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
  PeakActivityPeriods: PeakActivityPeriod;
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
  IsOnline: boolean;
}

export interface PeakActivityPeriod {
  messagesOverTime: { [key: string]: number };
  subOnlyMessagesOverTime: { [key: string]: number };
  emoteOnlyMessagesOverTime: { [key: string]: number };
  slowModeMessagesOverTime: { [key: string]: number };
  trend: Trend;
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