import { Trend } from "./user.model";

export class SubscriptionStatistic {
    totalSubscribers: number;
    totalNewSubscribers: number;
    totalReSubscribers: number;
    totalCommunitySubscriptions: number;
    totalGiftedSubscriptions: number;
    averageSubscriptionMonths: number;
    topSubscribers: { [key: string]: number };
    subscriptionsOverTime: { key: string; value: number }[];
    trend: Trend;

    constructor() {
        this.totalSubscribers = 0;
        this.totalNewSubscribers = 0;
        this.totalReSubscribers = 0;
        this.totalCommunitySubscriptions = 0;
        this.totalGiftedSubscriptions = 0;
        this.averageSubscriptionMonths = 0;
        this.topSubscribers = {};
        this.subscriptionsOverTime = [];
        this.trend = Trend.Stable;
    }
  }