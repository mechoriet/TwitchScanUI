export interface ChatMessage {
    channel:     string;
    chatMessage: TwitchChatMessage;
    time:        Date;
    id:          string;
}

export interface TwitchChatMessage {
    badgeInfo:            any[];
    bits:                 number;
    bitsInDollars:        number;
    channel:              string;
    cheerBadge:           null;
    customRewardId:       null;
    emoteReplacedMessage: null;
    id:                   string;
    isBroadcaster:        boolean;
    isFirstMessage:       boolean;
    isHighlighted:        boolean;
    isMe:                 boolean;
    isModerator:          boolean;
    isSkippingSubMode:    boolean;
    isSubscriber:         boolean;
    isVip:                boolean;
    isStaff:              boolean;
    isPartner:            boolean;
    message:              string;
    noisy:                number;
    roomId:               string;
    subscribedMonthCount: number;
    tmiSentTs:            string;
    chatReply:            null;
    badges:               Badge[];
    botUsername:          string;
    color:                Color;
    colorHex:             string;
    displayName:          string;
    emoteSet:             EmoteSet;
    isTurbo:              boolean;
    userId:               string;
    username:             string;
    userType:             number;
    rawIrcMessage:        string;
}

export interface Badge {
    key:   string;
    value: string;
}

export interface Color {
    r:             number;
    g:             number;
    b:             number;
    a:             number;
    isKnownColor:  boolean;
    isEmpty:       boolean;
    isNamedColor:  boolean;
    isSystemColor: boolean;
    name:          string;
}

export interface EmoteSet {
    emotes:            any[];
    rawEmoteSetString: string;
}
