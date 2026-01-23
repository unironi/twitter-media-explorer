import { NextRequest, NextResponse } from "next/server";
import { TwitterApiIoClient } from "@/lib/twitterApiIoClient";
import { TwitterUserMedia } from "@/lib/twitterProvider";

const twitterClient = new TwitterApiIoClient();

// helper function to not show retweets by user in media timeline
function filterOriginalMedia(tweets: TwitterUserMedia[]) {
  return tweets.filter((t) => {
    if (t.is_retweet) return false;

    // keep if the user introduced content
    return Boolean(t.image || t.video || t.gif || t.text);
  });
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const userId = searchParams.get("userId");
    const cursor = searchParams.get("cursor") ?? "";

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const { media, next_cursor } = await twitterClient.getUserTweets(userId, cursor);

    const filtered = filterOriginalMedia(media);

    return NextResponse.json({
      media: filtered,
      next_cursor: next_cursor,
    });
  } catch (err: any) {
    console.error(err);

    if (err.message?.includes("Too Many Requests")) {
      return NextResponse.json(
        { error: "Rate limit reached. Please wait and try again." },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
