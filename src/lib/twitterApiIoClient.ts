import { TwitterProvider, NormalizedTweet, TwitterUser } from "./twitterProvider";
import { rateLimitedFetch } from "./twitterRateLimiter";
import { TwitterUserMedia } from "./twitterProvider";

const BASE_URL = "https://api.twitterapi.io/twitter";
const API_KEY = process.env.TWITTERAPI_IO_KEY!;

console.log("API KEY PRESENT:", Boolean(API_KEY));

export class TwitterApiIoClient implements TwitterProvider {

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
    const t = json.tweets[0];

    if (!t) {
      throw new Error("Tweet not found");
    }

    return {
      id: t.id,
      created_at: t.createdAt,
      author: {
        id: t.author?.id,
        username: t.author?.userName,
        profile_image_url: t.author?.profilePicture,
      },
      public_metrics: {
        like_count: t.likeCount,
        retweet_count: t.retweetCount,
        reply_count: t.replyCount,
        quote_count: t.quoteCount,
      },
    };
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
    return (json.users ?? []).map((u: any): TwitterUser => ({
      id: u.id,
      username: u.userName,
      name: u.name,
      profile_image_url: u.profilePicture,
      public_metrics: {
        followers_count: u.followers,
        following_count: u.following,
        tweet_count: u.statusesCount,
      },
    }));
  }

  async getUserTweets(userId: string) {
    const res = await rateLimitedFetch(
      `${BASE_URL}/user/last_tweets?userId=${userId}`, // last_tweets returns 20 tweets per page
      {
        headers: { "X-API-Key": API_KEY },
      }
    );

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`TwitterAPI.io error: ${text}`);
    }

    const json = await res.json();
    return (json.data.tweets ?? []).map((t: any): TwitterUserMedia => {
      const media = t.extendedEntities?.media?.[0];

      return {
        id: t.id,
        url: t.url,
        type: media? media.type : "text", // if extendedEntities is empty, there's only text in the og twt
        text: t.text,
        image: media? media.media_url_https : null, // both extendedEntities.media.type == "photo" or "video" have media_url_https with the image/thumbnail URL
        video: media? media.video_info?.variants?.[3].url : null, // 4 different video variants, 4th version has highest bitrate and format video/mp4
        gif: media? media.video_info?.variants?.[0].url : null, // animated gifs only have 1 variant
        public_metrics: {
          like_count: t.likeCount,
          retweet_count: t.retweetCount,
          reply_count: t.replyCount,
          quote_count: t.quoteCount,
        },
        created_at: t.createdAt,
        is_reply: t.isReply,
        is_retweet: t.retweeted_tweet ? true : false,
      }
      
    });
  }
}
