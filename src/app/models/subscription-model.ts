export interface SubscriptionStatistic {
    totalSubscribers: number;
    totalNewSubscribers: number;
    totalReSubscribers: number;
    totalGiftedSubscriptions: number;
    averageSubscriptionMonths: number;
    topSubscribers: { [key: string]: number };
  }