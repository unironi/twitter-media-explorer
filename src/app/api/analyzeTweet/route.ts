import { NextRequest, NextResponse } from "next/server";
import { TwitterApiIoClient } from "@/lib/twitterApiIoClient";
import { getCachedRetweeters, setCachedRetweeters } from "@/lib/retweeterCache";
import { getCachedTweet, setCachedTweet } from "@/lib/tweetCache";

import { sampleUsers } from "@/lib/sampleUsers";

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
      }
    }

    // check if the tweet has retweeters
    let retweeters = getCachedRetweeters(tweetId);

    if (!retweeters) {
      retweeters = await twitterClient.getRetweeters(tweetId);
      retweeters = retweeters ? retweeters : [];
      setCachedRetweeters(tweetId, retweeters);
    }

    const sampledUsers = retweeters ? sampleUsers(retweeters) : [];

    return NextResponse.json({
        success: true,
        tweet,
        retweeterCount: retweeters ? retweeters.length : 0,
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






/*import { NextRequest, NextResponse } from "next/server";

const api_base_url = "https://api.twitter.com/2";

// parse tweet ID
function extractTweetId(url: string): string | null {
  const match = url.match(/status\/(\d+)/);
  return match ? match[1] : null;
}

async function fetchTweet(tweetId: string) {
  const result = await fetch(`${api_base_url}/tweets/${tweetId}?tweet.fields=author_id,created_at,public_metrics`,
    {
      headers: {
        Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
      },
    }
  );

  if (!result.ok) {
    const error = await result.json();
    throw new Error(error?.detail || "Tweet not found");
  }

  return result.json();
}

export async function POST(req: NextRequest) {
  try {
    const { tweetUrl } = await req.json();

    // checking if url is syntactically correct
    if (!tweetUrl || typeof tweetUrl !== "string") {
      return NextResponse.json(
        { error: "tweetUrl is required" },
        { status: 400 }
      );
    }

    // checking if the URL contains a tweet ID
    const tweetId = extractTweetId(tweetUrl);

    if (!tweetId) {
      return NextResponse.json(
        { error: "Invalid Twitter URL" },
        { status: 400 }
      );
    }

    // checking if the tweet actually exists based on the ID
    const tweetExists = await fetchTweet(tweetId);

    return NextResponse.json({
      success: true,
      tweetId,
      tweet: tweetExists.data
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || "failed to fetch tweet" },
      { status: 500 }
    );
  }
}
*/

