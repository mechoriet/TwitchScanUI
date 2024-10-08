import { Trend } from "./user.model";

export interface SentimentAnalysis {
    sentimentOverTime: SentimentOverTime[];
    topPositiveUsers: SentimentUser[];
    topNegativeUsers: SentimentUser[];
    topPositiveMessages: SentimentMessage[];
    topNegativeMessages: SentimentMessage[];
    trend: Trend;
  }
  
  export interface SentimentOverTime {
    time: string;
    averagePositive: number;
    averageNegative: number;
    averageNeutral: number;
    averageCompound: number;
    messageCount: number;
  }
  
  export interface SentimentUser {
    username: string;
    averagePositive: number;
    averageNegative: number;
    averageNeutral: number;
    averageCompound: number;
    messageCount: number;
  }
  
  export interface SentimentMessage {
    username: string;
    message: string;
    positive: number;
    negative: number;
    neutral: number;
    compound: number;
    time: string;
  }