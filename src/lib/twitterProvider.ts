export interface NormalizedTweet {
  id: string;
  createdAt: string;
  author: {
    id: string;
    username: string;
    profile_image_url?: string;
  };
  public_metrics: {
    like_count: number;
    retweet_count: number;
    reply_count?: number;
    quote_count?: number;
  };
  isRetweet: boolean;
  isQuote: boolean;

  // for media extraction
  media?: any[];
  retweetedTweet?: any;
  quotedTweet?: any;
}


// retweeter
export interface TwitterUser {
  id: string;
  username: string;
  name?: string;
  profile_image_url?: string;
  public_metrics?: {
    followers_count: number;
    following_count: number;
    tweet_count: number;
  };
}

// retweeter's media
export interface TwitterUserMedia {
  tweetId: string;
  mediaId: string;
  type: "video" | "photo" | "animated_gif";
  url: string;
  preview?: string;
  metrics: {
    like_count: number;
    retweet_count: number;
    reply_count?: number;
    quote_count?: number;
  };
  createdAt: string;
  author: {
    id: string,
    username: string,
  }
}

export interface UserAndMedia {
  user: TwitterUser;
  media: TwitterUserMedia[];
}

export interface TwitterProvider {
  getTweetById(tweetId: string): Promise<NormalizedTweet>;
  getRetweeters(tweetId: string): Promise<TwitterUser[]>;
  // getUserTweets(userId: string, userName: string, tweetsLimit: number, mediaLimit: number): Promise<UserAndMedia>;
}
