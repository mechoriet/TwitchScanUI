export interface TwitchChatMessage {
    channel:     string;
    chatMessage: ChatMessageClass;
    time:        Date;
    id:          string;
}

export interface ChatMessageClass {
    username: string;
    message:  string;
    colorHex: string | undefined;
    emotes:   Emote[];
}

export interface Emote {
    id:         string;
    name:       string;
    imageUrl:   string;
    startIndex: number;
    endIndex:   number;
}

export interface ChannelMessage {
    channel: string;
    chatMessage: ChatMessageClass;
    time:        Date;
  }
  
  export interface ChatHistory {
    username: string;
    messages: ChannelMessage[];
  }
  