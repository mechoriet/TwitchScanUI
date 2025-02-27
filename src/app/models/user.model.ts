import { BotLikeliness } from "./bot-detection.model";
import { EmoteUsage } from "./emote.model";
import { RaidStatisticResult } from "./raid-model";
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

export class UserData {
  AverageMessageLength: number;
  EmoteUsage: EmoteUsage[];
  LinksShared: number;
  MessageIntervalMs: number;
  PeakActivityPeriods: PeakActivityPeriod;
  SentenceFrequency: { [key: string]: number };
  SentimentAnalysis: SentimentAnalysis;
  SubscriptionStatistic: SubscriptionStatistic;
  BotLikeliness: BotLikeliness;
  TotalBans: TotalBans;
  TotalMessages: number;
  TotalTimeouts: TotalTimeouts;
  TotalUsers: number;
  UniqueWords: number;
  UniqueChatters: number;
  WordFrequency: { [key: string]: number };
  BitsCheeredStatistic: Array<{ key: string; value: number }>;
  ChannelMetrics: ChannelMetrics;
  IsOnline: boolean;
  RaidStatistic: RaidStatisticResult | undefined;

  constructor() {
    this.AverageMessageLength = 0;
    this.EmoteUsage = [];
    this.LinksShared = 0;
    this.MessageIntervalMs = 0;
    this.PeakActivityPeriods = {
      messagesOverTime: {},
      subOnlyMessagesOverTime: {},
      emoteOnlyMessagesOverTime: {},
      slowModeMessagesOverTime: {},
      bitsOverTime: {},
      trend: Trend.Stable
    };
    this.SentenceFrequency = {};
    this.SentimentAnalysis = new SentimentAnalysis();
    this.SubscriptionStatistic = new SubscriptionStatistic();
    this.BotLikeliness = new BotLikeliness();
    this.TotalBans = { TotalBans: 0, BanReasons: [] };
    this.TotalMessages = 0;
    this.TotalTimeouts = { TotalTimeouts: 0, totalTimeoutDuration: 0, AverageTimeoutDuration: 0, timeoutReasons: [] };
    this.TotalUsers = 0;
    this.UniqueWords = 0;
    this.UniqueChatters = 0;
    this.WordFrequency = {};
    this.BitsCheeredStatistic = [];
    this.ChannelMetrics = {
      viewerStatistics: { currentViewers: 0, averageViewers: 0, peakViewers: 0 },
      currentGame: "",
      uptime: "",
      viewersOverTime: {},
      totalWatchTime: 0,
      trend: Trend.Stable
    };
    this.IsOnline = false;
    this.RaidStatistic = undefined;
  }
}

export interface PeakActivityPeriod {
  messagesOverTime: { [key: string]: number };
  subOnlyMessagesOverTime: { [key: string]: number };
  emoteOnlyMessagesOverTime: { [key: string]: number };
  slowModeMessagesOverTime: { [key: string]: number };
  bitsOverTime: { [key: string]: number };
  trend: Trend;
}

export interface TotalBans {
  TotalBans: number;
  BanReasons: any[];
}

export interface TotalTimeouts {
  TotalTimeouts: number;
  totalTimeoutDuration: number;
  AverageTimeoutDuration: number;
  timeoutReasons: any[];
}