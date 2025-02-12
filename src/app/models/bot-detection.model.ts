export interface SuspiciousUser {
    username: string;
    likelinessPercentage: number;
}

export interface BotLikelinessSnapshot {
    timestamp: string;
    users: SuspiciousUser[];
}

export class BotLikeliness {
    topSuspiciousUsers: SuspiciousUser[];
    recentSnapshots: BotLikelinessSnapshot[];
    time: string;
    id: string;

    constructor() {
        this.topSuspiciousUsers = [];
        this.recentSnapshots = [];
        this.time = "";
        this.id = "";
    }
}
