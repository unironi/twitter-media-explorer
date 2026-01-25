import { NextRequest, NextResponse } from "next/server";
import { TwitterApiIoClient } from "@/lib/twitterApiIoClient";
import { getCachedRetweeters, setCachedRetweeters } from "@/lib/retweeterCache";
import { getCachedTweet, setCachedTweet } from "@/lib/tweetCache";
import { sampleUsers } from "@/lib/sampleUsers";
import type { UserAndMedia } from "@/lib/twitterProvider";


const twitterClient = new TwitterApiIoClient();

// helper function to check if url is valid string
function urlValid(body: any): string {
  return typeof body.tweetUrl === "string" ? body.tweetUrl.trim() : "";
}

// helper function to parse tweet ID
function extractTweetId(url: string): string | null {
  try {
    const parsed = new URL(url);
    const match = parsed.pathname.match(/status\/(\d+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {

    const body = await req.json();

    // --- checking if url is syntactically correct ---
    const rawUrl = urlValid(body);

    if (!rawUrl) {
      return NextResponse.json(
        { error: "tweetUrl is required" },
        { status: 400 }
      );
    }

    console.log("Calling twitterapi.io:", rawUrl);

    // --- checking if the URL contains a tweet ID ---
    const tweetId = extractTweetId(rawUrl);

    if (!tweetId) {
      return NextResponse.json(
        { error: "Invalid Twitter/X URL" },
        { status: 400 }
      );
    }

    // --- check if tweet exists (first in cache- otherwise fetch) ---
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

    // --- check if the tweet has retweeters ---
    let retweeters = getCachedRetweeters(tweetId);

    if (!retweeters) {
      retweeters = await twitterClient.getRetweeters(tweetId);
      retweeters = retweeters ? retweeters : [];
      setCachedRetweeters(tweetId, retweeters);
    }

    // --- paginate retweeters so ~5 are returned at a time ---
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") ?? 0); // gets updated page number from loadMore() in page.tsx
    const limit = Number(searchParams.get("limit") ?? 5); // number of results per page

    const start = page * limit;
    const end = start + limit;

    const usersPage = retweeters.slice(start, end); // pagination is array slicing

    // --- get each user's posts to display in profile card ---
    const feed: UserAndMedia[] = await Promise.all(
      usersPage.map(async (user) => {
        const posts = (await twitterClient.getUserTweets(user.id)).media; // getUserTweets returns timeline containing media (20 results per page) and cursor (pagination)
        return {
          user_id: user.id,
          media: posts,
        };
      })
    );

    return NextResponse.json({
      success: true,
      id: tweet.id,
      users: usersPage,
      hasMore: end < retweeters.length, // if end of the page is less than number of retweeters, there's still more to load
      total: retweeters.length,
      usersFeed: feed,
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