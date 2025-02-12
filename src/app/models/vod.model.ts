export interface MutedSegment {
    duration: number;
    offset: number;
  }
  
  export interface Video {
    createdAt: string;
    description: string;
    duration: string;
    id: string;
    language: string;
    publishedAt: string;
    thumbnailUrl: string;
    title: string;
    type: string;
    url: string;
    userId: string;
    userLogin: string;
    userName: string;
    viewable: string;
    viewCount: number;
    streamId: string;
    mutedSegments?: MutedSegment[];
  }
  
  export interface VodsResponse {
    videos: Video[];
    pagination: {
      cursor: string;
    };
  }
  