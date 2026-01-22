export interface NormalizedTweet {
  id: string;
  created_at: string;
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
  // is_retweet: boolean;
  // is_quote: boolean;

  // // for media extraction
  // media?: any[];
  // retweetedTweet?: any;
  // quotedTweet?: any;
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
  id: string;
  url: string;
  text: string;
  public_metrics: {
    like_count: number;
    retweet_count: number;
    reply_count?: number;
    quote_count?: number;
  };
  created_at: string;
  is_reply: boolean;
  is_retweet: boolean;
}

export interface UserAndMedia {
  user_id: string;
  media: TwitterUserMedia[];
}

export interface TwitterProvider {
  getTweetById(tweetId: string): Promise<NormalizedTweet>;
  getRetweeters(tweetId: string): Promise<TwitterUser[]>;
  getUserTweets(userId: string): Promise<TwitterUserMedia[]>;
}
