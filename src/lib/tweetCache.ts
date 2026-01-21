import { NormalizedTweet } from "./twitterProvider";

const cache = new Map<string, NormalizedTweet>();

export function getCachedTweet(tweetId: string) {
  return cache.get(tweetId);
}

export function setCachedTweet(tweetId: string, tweet: NormalizedTweet) {
  cache.set(tweetId, tweet);
}

export function clearTweetCache() {
  cache.clear();
}
