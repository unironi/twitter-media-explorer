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