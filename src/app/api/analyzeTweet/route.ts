import { NextRequest, NextResponse } from "next/server";
import { TwitterApiIoClient } from "@/lib/twitterApiIoClient";
import { getCachedRetweeters, setCachedRetweeters } from "@/lib/retweeterCache";
import { getCachedTweet, setCachedTweet } from "@/lib/tweetCache";
import { sampleUsers } from "@/lib/sampleUsers";
import type { UserAndMedia } from "@/lib/twitterProvider";


const twitterClient = new TwitterApiIoClient();

// function to check if url is valid string
function urlValid(body: any): string {
  return typeof body.tweetUrl === "string" ? body.tweetUrl.trim() : "";
}

// function to parse tweet ID
function extractTweetId(url: string): string | null {
  try {
    const parsed = new URL(url);
    const match = parsed.pathname.match(/status\/(\d+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}
// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json();

//     // checking if url is syntactically correct
//     const rawUrl = urlValid(body);

//     if (!rawUrl) {
//       return NextResponse.json(
//         { error: "tweetUrl is required" },
//         { status: 400 }
//       );
//     }

//     // checking if the URL contains a tweet ID
//     const tweetId = extractTweetId(rawUrl);

//     if (!tweetId) {
//       return NextResponse.json(
//         { error: "Invalid Twitter/X URL" },
//         { status: 400 }
//       );
//     }

//     console.log(`\n=== Processing Tweet ID: ${tweetId} ===`);

//     // check if tweet exists (first in cache- otherwise fetch)
//     let tweet = getCachedTweet(tweetId);

//     if (!tweet) {
//       console.log('Tweet not in cache, fetching from API...');
//       try {
//         tweet = await twitterClient.getTweetById(tweetId);
//         if (tweet) {
//           setCachedTweet(tweetId, tweet);
//           console.log('✓ Tweet fetched and cached');
//         } else {
//           return NextResponse.json(
//             { error: "Tweet not found or unavailable" },
//             { status: 404 }
//           );
//         }
//       } catch (apiError: any) {
//         console.error('Error fetching tweet:', apiError.message);
        
//         // Return more specific error messages
//         if (apiError.message.includes('Rate limit')) {
//           return NextResponse.json(
//             { error: "Rate limit reached. Please wait a few minutes and try again." },
//             { status: 429 }
//           );
//         } else if (apiError.message.includes('not found') || apiError.message.includes('404')) {
//           return NextResponse.json(
//             { error: "Tweet not found. It may have been deleted or is private." },
//             { status: 404 }
//           );
//         } else if (apiError.message.includes('authentication') || apiError.message.includes('401') || apiError.message.includes('403')) {
//           return NextResponse.json(
//             { error: "API authentication error. Please contact support." },
//             { status: 500 }
//           );
//         } else {
//           return NextResponse.json(
//             { error: `Failed to fetch tweet: ${apiError.message}` },
//             { status: 500 }
//           );
//         }
//       }
//     } else {
//       console.log('✓ Tweet found in cache');
//     }

//     // check if the tweet has retweeters
//     let retweeters = getCachedRetweeters(tweetId);

//     if (!retweeters) {
//       console.log('Retweeters not in cache, fetching from API...');
//       try {
//         retweeters = await twitterClient.getRetweeters(tweetId);
//         retweeters = retweeters ? retweeters : [];
//         setCachedRetweeters(tweetId, retweeters);
//         console.log(`✓ Found ${retweeters.length} retweeters`);
//       } catch (apiError: any) {
//         console.error('Error fetching retweeters:', apiError.message);
//         // Continue with empty retweeters array instead of failing
//         retweeters = [];
//       }
//     } else {
//       console.log(`✓ Found ${retweeters.length} retweeters in cache`);
//     }

//     // grab 5-10 random users from retweets
//     const sampledUsers = retweeters.length > 0 ? sampleUsers(retweeters) : [];
//     console.log(`Sampling ${sampledUsers.length} users`);

//     // grab recent posts of sampled retweeters
//     const feeds: UserAndMedia[] = [];

//     for (const user of sampledUsers) {
//       try {
//         console.log(`\nFetching feed for @${user.username}...`);
//         const feed = await twitterClient.getUserTweets(
//           user.id,
//           user.username,
//           100,
//           9
//         );

//         if (feed.media.length > 0) {
//           feeds.push(feed);
//           console.log(`✓ Added ${feed.media.length} media items from @${user.username}`);
//         } else {
//           console.warn(`⚠️ User @${user.username} has no media`);
//         }
//       } catch (err: any) {
//         // Gracefully skip private / suspended / failed users
//         console.warn(`⚠️ Skipping user @${user.username}: ${err.message}`);
//       }
//     }

//     console.log(`\n=== Final Results ===`);
//     console.log(`Total feeds with media: ${feeds.length}`);
//     console.log(`Total media items: ${feeds.reduce((sum, f) => sum + f.media.length, 0)}`);

//     return NextResponse.json({
//       success: true,
//       tweet,
//       retweeterCount: retweeters.length,
//       sampledUserCount: sampledUsers.length,
//       feeds,
//     });
//   } catch (err: any) {
//     console.error('Unhandled error in route handler:', err);

//     if (typeof err.message === "string" && err.message.includes("Too Many Requests")) {
//       return NextResponse.json(
//         { error: "Rate limit reached. Please wait a few seconds and try again." },
//         { status: 429 }
//       );
//     }

//     return NextResponse.json(
//       { error: err.message || "Server error" },
//       { status: 500 }
//     );
//   }
// }

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // checking if url is syntactically correct
    const rawUrl = urlValid(body);

    if (!rawUrl) {
      return NextResponse.json(
        { error: "tweetUrl is required" },
        { status: 400 }
      );
    }

    console.log("Calling twitterapi.io:", rawUrl);


    // checking if the URL contains a tweet ID
    const tweetId = extractTweetId(rawUrl);

    if (!tweetId) {
      return NextResponse.json(
        { error: "Invalid Twitter/X URL" },
        { status: 400 }
      );
    }

    // check if tweet exists (first in cache- otherwise fetch)
    let tweet = getCachedTweet(tweetId);

    if (!tweet) {
      tweet = await twitterClient.getTweetById(tweetId);
      if (tweet) {
        setCachedTweet(tweetId, tweet);
      } else {
        return NextResponse.json(
          { error: "Tweet not found or unavailable" },
          { status: 404 }
        );
      }

    }

    // check if the tweet has retweeters
    let retweeters = getCachedRetweeters(tweetId);

    if (!retweeters) {

      retweeters = await twitterClient.getRetweeters(tweetId);
      retweeters = retweeters ? retweeters : [];
      setCachedRetweeters(tweetId, retweeters);
    }

    // grab 5-10 random users from retweets
    const sampledUsers = retweeters ? sampleUsers(retweeters) : [];

    // grab recent posts of sampled retweeters
    // const feeds: UserAndMedia[] = [];

    // for (const user of sampledUsers) {
    //   try {
    //     const feed = await twitterClient.getUserTweets(
    //       user.id,
    //       user.username,
    //       100,
    //       9
    //     );

    //     if (feed.media.length > 0) {
    //       feeds.push(feed);
    //     }
    //     if (feed.media.length === 0) {
    //       console.warn(`User ${user.username} has no media`);
    //     }
    //   } catch (err) {
    //     // skip private / suspended / failed users
    //     console.warn(`Skipping user ${user.username}`, err);
    //   }
    // }

    return NextResponse.json({
        success: true,
        tweet,
        retweeterCount: retweeters.length,
        sampledUsers,
    });
  } catch (err: any) {
    console.error(err);

    if (typeof err.message === "string" && err.message.includes("Too Many Requests")) {
      return NextResponse.json(
        { error: "Rate limit reached. Please wait a few seconds and try again." },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}