import { Trend } from "./user.model";

export interface RaidStatisticResult {
    totalRaids: number;
    topRaiders: { [key: string]: number };
    raidsOverTime: { key: string; value: string }[];
}