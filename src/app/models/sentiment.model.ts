import { Trend } from "./user.model";

export class SentimentAnalysis {
    sentimentOverTime: SentimentOverTime[];
    topUsers: SentimentUser[];
    topPositiveUsers: SentimentUser[];
    topNegativeUsers: SentimentUser[];
    topPositiveMessages: SentimentMessage[];
    topNegativeMessages: SentimentMessage[];
    trend: Trend;

    constructor() {
      this.sentimentOverTime = [];
      this.topUsers = [];
      this.topPositiveUsers = [];
      this.topNegativeUsers = [];
      this.topPositiveMessages = [];
      this.topNegativeMessages = [];
      this.trend = Trend.Stable;
    }
  }
  
  export class SentimentOverTime {
    time: string;
    averagePositive: number;
    averageNegative: number;
    averageNeutral: number;
    averageCompound: number;
    messageCount: number;

    constructor(time: string, averagePositive: number, averageNegative: number, averageNeutral: number, averageCompound: number, messageCount: number) {
      this.time = time;
      this.averagePositive = averagePositive;
      this.averageNegative = averageNegative;
      this.averageNeutral = averageNeutral;
      this.averageCompound = averageCompound;
      this.messageCount = messageCount;
    }
  }
  
  export class SentimentUser {
    username: string;
    averagePositive: number;
    averageNegative: number;
    averageNeutral: number;
    averageCompound: number;
    messageCount: number;

    constructor(username: string, averagePositive: number, averageNegative: number, averageNeutral: number, averageCompound: number, messageCount: number) {
      this.username = username;
      this.averagePositive = averagePositive;
      this.averageNegative = averageNegative;
      this.averageNeutral = averageNeutral;
      this.averageCompound = averageCompound;
      this.messageCount = messageCount;
    }
  }
  
  export class SentimentMessage {
    username: string;
    message: string;
    positive: number;
    negative: number;
    neutral: number;
    compound: number;
    time: string;

    constructor(username: string, message: string, positive: number, negative: number, neutral: number, compound: number, time: string) {
      this.username = username;
      this.message = message;
      this.positive = positive;
      this.negative = negative;
      this.neutral = neutral;
      this.compound = compound;
      this.time = time;
    }
  }