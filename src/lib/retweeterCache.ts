import { TwitterUser } from "./twitterProvider";

const cache = new Map<string, TwitterUser[]>();

export function getCachedRetweeters(tweetId: string) {
  return cache.get(tweetId);
}

export function setCachedRetweeters(
  tweetId: string,
  users: TwitterUser[]
) {
  cache.set(tweetId, users);
}

export function clearCache() {
  cache.clear();
}
