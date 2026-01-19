import { TweetData } from "./twitterProvider";

const cache = new Map<string, TweetData>();

export function getCachedTweet(tweetId: string) {
  return cache.get(tweetId);
}

export function setCachedTweet(tweetId: string, tweet: TweetData) {
  cache.set(tweetId, tweet);
}

export function clearTweetCache() {
  cache.clear();
}
