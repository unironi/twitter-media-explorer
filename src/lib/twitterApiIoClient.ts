import { TwitterProvider, NormalizedTweet, TwitterUser } from "./twitterProvider";
import { rateLimitedFetch } from "./twitterRateLimiter";
import { TwitterUserMedia } from "./twitterProvider";

const BASE_URL = "https://api.twitterapi.io/twitter";
const API_KEY = process.env.TWITTERAPI_IO_KEY!;

console.log("API KEY PRESENT:", Boolean(API_KEY));


// check if media is a video/gif
export function isVideo(media: TwitterUserMedia) {
  return media.type === "video" || media.type === "animated_gif";
}

function extractMedia(tweet: any): any[] {
  return (
    tweet.media ??
    tweet.retweetedTweet?.media ??
    tweet.quotedTweet?.media ??
    []
  );
}

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
      createdAt: t.createdAt,
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
      isRetweet: Boolean(t.isRetweet),
      isQuote: Boolean(t.isQuote),
      media: t.media,
      retweetedTweet: t.retweetedTweet,
      quotedTweet: t.quotedTweet,
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

  // async getUserTweets(userId: string, userName: string, tweetsLimit: number = 100, mediaLimit: number = 9) {
  //   const res = await rateLimitedFetch(
  //     `${BASE_URL}/user/last_tweets?userId=${userId}&limit=${tweetsLimit}&includeRetweets=false`, // includeReplies = false by default
  //     {
  //       headers: { "X-API-Key": API_KEY },
  //     }
  //   );

  //   if (!res.ok) {
  //     const text = await res.text();
  //     throw new Error(`TwitterAPI.io error: ${text}`);
  //   }

  //   const json = await res.json();

  //   // Debug: Log the entire response structure
  //   console.log(`=== Response for user ${userName} (${userId}) ===`);
  //   // console.log('Full JSON:', JSON.stringify(json, null, 2));

  //   const tweets = json.data.tweets ?? [];

  //   console.log(`Total tweets returned: ${tweets.length}`);

  //   const videos: TwitterUserMedia[] = [];
  //   const images: TwitterUserMedia[] = [];

  //   var i: number = 0;
  //   for (const tweet of tweets) {

  //     // Debug: Log each tweet's structure
  //     console.log(`\nTweet ${i}:`, {
  //       id: tweet.id,
  //       hasMedia: !!tweet.media,
  //       hasRetweetedTweet: !!tweet.retweetedTweet,
  //       hasQuotedTweet: !!tweet.quotedTweet,
  //       mediaCount: tweet.media?.length || 0,
  //       isRetweet: tweet.isRetweet,
  //     });

  //     const mediaItems = extractMedia(tweet);
      
  //     if (mediaItems.length === 0) {
  //       console.log(`  → No media found in tweet ${tweet.id}`);
  //       continue;
  //     }

  //     console.log(`  → Found ${mediaItems.length} media items`);

  //     for (const item of mediaItems) { // looping over media

  //       console.log('    Media item:', {
  //         id: item.id || item.mediaKey,
  //         type: item.type,
  //         hasVideoInfo: !!item.videoInfo,
  //         hasMediaUrlHttps: !!item.mediaUrlHttps,
  //       });

  //       const normalized = {
  //         tweetId: tweet.id,
  //         mediaId: item.id || item.mediaKey,
  //         type: item.type,
  //         url:
  //           item.videoInfo?.variants?.[0]?.url ??
  //           item.mediaUrlHttps,
  //         preview: item.mediaUrlHttps,
  //         metrics: tweet.publicMetrics,
  //         createdAt: tweet.createdAt,
  //         author: {
  //           id: userId,
  //           username: userName
  //         }
  //       };

  //       if (normalized.type === "video" || normalized.type === "animated_gif") {
  //         videos.push(normalized);
  //         console.log('    ✓ Added as video');
  //       } else if (normalized.type === "photo") {
  //         images.push(normalized);
  //         console.log('    ✓ Added as image');
  //       }

  //       if (videos.length + images.length >= mediaLimit) break;
  //     }
  //     i++;
  //     if (videos.length + images.length >= mediaLimit) break;
  //   }

  //   console.log(`\nFinal counts for ${userName}: ${videos.length} videos, ${images.length} images`);

  //   const profilePicture = tweets[0]?.author?.profilePicture;

  //   return {
  //     user: {
  //       id: userId,
  //       username: userName,
  //       profile_image_url: profilePicture,
  //     },
  //     media: [...videos, ...images].slice(0, mediaLimit),
  //   };
  // }


  // --------


//   async getUserTweets(userId: string, userName: string, tweetsLimit: number = 100, mediaLimit: number = 9) {
//   const res = await rateLimitedFetch(
//     `${BASE_URL}/user/last_tweets?userId=${userId}&limit=${tweetsLimit}`,
//     {
//       headers: { "X-API-Key": API_KEY },
//     }
//   );

//   if (!res.ok) {
//     const text = await res.text();
//     throw new Error(`TwitterAPI.io error: ${text}`);
//   }

//   const json = await res.json();
  
//   // Debug: Log the actual structure
//   console.log(`\n=== API Response Structure for ${userName} ===`);
//   console.log('Keys in response:', Object.keys(json));
//   console.log('Full response:', JSON.stringify(json, null, 2).substring(0, 500));
  
//   // Handle multiple possible response structures
//   let tweets = [];
//   if (Array.isArray(json.tweets)) {
//     tweets = json.tweets;
//   } else if (json.data && Array.isArray(json.data.tweets)) {
//     tweets = json.data.tweets;
//   } else if (Array.isArray(json)) {
//     tweets = json;
//   }
  
//   console.log(`Total tweets found: ${tweets.length}`);

//   if (tweets.length === 0) {
//     console.warn(`No tweets found for user ${userName} (${userId})`);
//     return {
//       user: {
//         id: userId,
//         username: userName,
//         profile_image_url: undefined,
//       },
//       media: [],
//     };
//   }

//   const videos: TwitterUserMedia[] = [];
//   const images: TwitterUserMedia[] = [];

//   for (let i = 0; i < tweets.length; i++) {
//     const tweet = tweets[i];
    
//     console.log(`\nTweet ${i} (ID: ${tweet.id}):`, {
//       hasMedia: !!tweet.media,
//       hasExtendedEntities: !!tweet.extendedEntities,
//       hasRetweetedTweet: !!tweet.retweetedTweet,
//       hasQuotedTweet: !!tweet.quotedTweet,
//     });
    
//     const mediaItems = extractMedia(tweet);
    
//     if (mediaItems.length === 0) {
//       console.log(`  → No media in tweet ${tweet.id}`);
//       continue;
//     }
    
//     console.log(`  → Found ${mediaItems.length} media items`);

//     for (const item of mediaItems) {
//       console.log('    Processing media:', {
//         type: item.type,
//         id: item.id_str || item.mediaKey || item.id,
//         hasVideoInfo: !!item.videoInfo,
//         hasMediaUrl: !!item.mediaUrlHttps,
//       });
      
//       const mediaUrl = item.mediaUrlHttps || item.media_url_https;
//       const videoUrl = item.videoInfo?.variants?.find((v: any) => 
//         v.content_type === 'video/mp4' && v.bitrate
//       )?.url || item.video_info?.variants?.find((v: any) => 
//         v.content_type === 'video/mp4' && v.bitrate
//       )?.url;
      
//       if (!mediaUrl && !videoUrl) {
//         console.log('    ⚠️ No valid URL found');
//         continue;
//       }

//       const normalized: TwitterUserMedia = {
//         tweetId: tweet.id,
//         mediaId: item.id_str || item.mediaKey || item.id || `${tweet.id}_${Math.random()}`,
//         type: item.type,
//         url: videoUrl || mediaUrl,
//         preview: mediaUrl,
//         metrics: {
//           like_count: tweet.likeCount ?? 0,
//           retweet_count: tweet.retweetCount ?? 0,
//           reply_count: tweet.replyCount ?? 0,
//           quote_count: tweet.quoteCount ?? 0,
//         },
//         createdAt: tweet.createdAt,
//         author: {
//           id: userId,
//           username: userName,
//         },
//       };

//       if (normalized.type === "video" || normalized.type === "animated_gif") {
//         videos.push(normalized);
//         console.log('    ✓ Added as video');
//       } else if (normalized.type === "photo") {
//         images.push(normalized);
//         console.log('    ✓ Added as photo');
//       }

//       if (videos.length + images.length >= mediaLimit) break;
//     }

//     if (videos.length + images.length >= mediaLimit) break;
//   }

//   console.log(`\nFinal: ${videos.length} videos, ${images.length} images for ${userName}\n`);

//   return {
//     user: {
//       id: userId,
//       username: userName,
//       profile_image_url: tweets[0]?.author?.profilePicture,
//     },
//     media: [...videos, ...images].slice(0, mediaLimit),
//   };
// }
}
