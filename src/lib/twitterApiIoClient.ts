import { TwitterProvider, TweetData, TwitterUser } from "./twitterProvider";
import { rateLimitedFetch } from "./twitterRateLimiter";

const BASE_URL = "https://api.twitterapi.io/twitter";
const API_KEY = process.env.TWITTERAPI_IO_KEY!;
const SKIP_VERIFY = process.env.NODE_ENV === "development";

export class TwitterApiIoClient implements TwitterProvider {
  // async getTweetById(tweetId: string): Promise<TweetData> {
  //   const res = await fetch(
  //     `${BASE_URL}/tweets?tweet_ids=${tweetId}`,
  //     {
  //       headers: {
  //         "X-API-Key": API_KEY,
  //       },
  //     }
  //   );

  //   if (!res.ok) {
  //     const text = await res.text();
  //     throw new Error(`TwitterAPI.io error: ${text}`);
  //   }

  //   const json = await res.json();

  //   const tweet = json.tweets?.[0];

  //   if (!tweet) {
  //     throw new Error("Tweet not found");
  //   }

  //   return {
  //     id: tweet.id,
  //     author_id: tweet.author.id,
  //     created_at: tweet.createdAt,
  //     public_metrics: {
  //       like_count: tweet.likeCount,
  //       retweet_count: tweet.retweetCount,
  //       reply_count: tweet.replyCount,
  //       quote_count: tweet.quoteCount,
  //     },
  //   };
  // }

  // async getRetweeters(tweetId: string): Promise<TwitterUser[]> {
  //   const res = await fetch(
  //     `${BASE_URL}/tweets/retweeters?tweet_id=${tweetId}`,
  //     {
  //       headers: {
  //         "X-API-Key": API_KEY,
  //       },
  //     }
  //   );

  //   if (!res.ok) {
  //     const text = await res.text();
  //     throw new Error(`TwitterAPI.io error: ${text}`);
  //   }

  //   const json = await res.json();

  //   return (json.users ?? []).map((u: any) => ({
  //     id: u.id,
  //     username: u.userName,
  //     name: u.name,
  //     profile_image_url: u.profilePicture,
  //     public_metrics: {
  //       followers_count: u.followers,
  //       following_count: u.following,
  //       tweet_count: u.statusesCount,
  //     },
  //   }));
  // }

    async getTweetById(tweetId: string) {
    const res = await rateLimitedFetch(
      `${BASE_URL}/tweets?tweet_ids=${tweetId}`,
      {
        headers: { "X-API-Key": API_KEY },
      }
    );

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`TwitterAPI.io error: ${text}`);
    }

    const json = await res.json();
    return json.tweets[0];
  }

  async getRetweeters(tweetId: string) {
    const res = await rateLimitedFetch(
      `${BASE_URL}/tweet/retweeters?tweetId=${tweetId}`,
      {
        headers: { "X-API-Key": API_KEY },
      }
    );

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`TwitterAPI.io error: ${text}`);
    }

    const json = await res.json();
    return json.users ?? [];
  }
}
