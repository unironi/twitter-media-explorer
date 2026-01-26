import { TwitterProvider, NormalizedTweet, TwitterUser } from "./twitterProvider";
import { rateLimitedFetch } from "./twitterRateLimiter";
import { TwitterUserMedia } from "./twitterProvider";

const BASE_URL = "https://api.twitterapi.io/twitter";
const API_KEY = process.env.TWITTERAPI_IO_KEY!;

console.log("API KEY PRESENT:", Boolean(API_KEY));

export class TwitterApiIoClient implements TwitterProvider {

  async getAuthorStatus(userName: string) {
    const res = await rateLimitedFetch(
      `${BASE_URL}/user/info?userName=${userName}`,
      {
        headers: { "X-API-Key": API_KEY },
      }
    );

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`TwitterAPI.io error: ${text}`);
    }

    const json = await res.json();
    const data = json.data;

    // if data is null - user does not exist
    // usually if data.unavailable = true, user is suspended
    let status = data? (data.unavailable? "suspended" : (data.protected? "protected" : "public")) : "null";
    return {
      status
    }
  }

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

  async getUserTweets(userId: string, cursor: string = "") {
    const res = await rateLimitedFetch(
      `${BASE_URL}/user/last_tweets?userId=${userId}&cursor=${encodeURIComponent(cursor)}`, // last_tweets returns 20 tweets per page
      {
        headers: { "X-API-Key": API_KEY },
      }
    );

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`TwitterAPI.io error: ${text}`);
    }

    const json = await res.json();
    const tweets = (json.data.tweets ?? []).map((t: any): TwitterUserMedia => {
      const media = t.extendedEntities?.media?.[0];
      let image = media? media.media_url_https : null;
      // let video = media? media.video_info?.variants?.[0].url : null; // this is indexing content type application/x-mpegURL - may not be the right type
      // let gif = media? media.video_info?.variants?.[0].url : null;

      let video: string | undefined;
      let gif: string | undefined;

      if (media?.video_info?.variants) {
        const mp4Variants = media.video_info.variants.filter( // filtering for video/mp4 not resolving 403 issue
          (v: any) => v.content_type === "video/mp4"
        );

        const bestVariant = mp4Variants.sort(
          (a: any, b: any) => (b.bitrate ?? 0) - (a.bitrate ?? 0)
        )[0];

        if (media.type === "video") video = bestVariant?.url;
        if (media.type === "animated_gif") gif = bestVariant?.url;
      }


      return {
        id: t.id,
        url: t.url,
        type: media? media.type : "text", // if extendedEntities is empty, there's only text in the og twt
        text: t.text,
        image, // both extendedEntities.media.type == "photo" or "video" have media_url_https with the image/thumbnail URL
        video, // 4 different video variants, 4th version has highest bitrate and format video/mp4
        gif, // animated gifs only have 1 variant
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

    return {
      media: tweets,
      next_cursor: json.next_cursor ?? null
    }
  }

}
