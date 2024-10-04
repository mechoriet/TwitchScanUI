import { UserData } from "./user.model";

export interface HistoryData {
    peakViewers:   number;
    totalMessages: number;
    statistics:    UserData;
    time:          Date;
}

export interface HistoryTimeline {
    id: string;
    time: Date;
    peakViewers: number;
    averageViewers: number;
}