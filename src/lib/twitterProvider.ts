export interface TweetData {
  id: string;
  author_id: string;
  created_at?: string;
  public_metrics?: {
    like_count: number;
    retweet_count: number;
    reply_count: number;
    quote_count: number;
  };
}

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

export interface TwitterProvider {
  getTweetById(tweetId: string): Promise<TweetData>;
  getRetweeters(tweetId: string): Promise<TwitterUser[]>;
}
