export interface SentimentAnalysis {
    sentimentOverTime: SentimentOverTime[];
    topPositiveUsers: SentimentUser[];
    topNegativeUsers: SentimentUser[];
    sentimentOverTimeLabeled: SentimentOverTimeLabeled[];
    topPositiveMessages: SentimentMessage[];
    topNegativeMessages: SentimentMessage[];
  }
  
  export interface SentimentOverTime {
    time: string;
    averagePositive: number;
    averageNegative: number;
    averageNeutral: number;
    averageCompound: number;
    messageCount: number;
  }
  
  export interface SentimentOverTimeLabeled {
    timePeriod: string;
    averagePositive: string;
    averageNegative: string;
    averageNeutral: string;
    averageCompound: string;
    messageCount: string;
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