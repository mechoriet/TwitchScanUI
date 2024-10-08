import { Trend } from "./user.model";

export interface SubscriptionStatistic {
    totalSubscribers: number;
    totalNewSubscribers: number;
    totalReSubscribers: number;
    totalCommunitySubscriptions: number;
    totalGiftedSubscriptions: number;
    averageSubscriptionMonths: number;
    topSubscribers: { [key: string]: number };
    subscriptionsOverTime: { key: string; value: number }[];
    trend: Trend;
  }