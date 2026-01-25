"use client";

import { useState } from "react";
import { ProfileCard } from "./component/ProfileCard";
import { ViewMoreModal } from "./component/ViewMoreModal";
import { TwitterUser } from "@/lib/twitterProvider";
import { useInfiniteScroll } from "./hooks/infiniteScroll";
import { resetSeenMedia, filterNewMedia } from "@/lib/mediaDedup";

export default function Home() {
  type UiError =
  { type: "input"; message: string }
  | { type: "search"; message: string }
  | { type: "profile"; message: string }
  | { type: "media"; message: string };

  const [error, setError] = useState<UiError | null>(null);
  const [tweetUrl, setTweetUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<TwitterUser[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [feeds, setFeeds] = useState<Map<string, any[]>>(new Map());
  const [viewMoreUser, setViewMoreUser] = useState<TwitterUser | null>(null);

  // helper function: checks if tweet is valid
  function isValidTweetUrl(url: string) {
    try {
      const u = new URL(url);
      return /twitter\.com|x\.com/.test(u.hostname) && /status\/\d+/.test(u.pathname);
    } catch {
      return false;
    }
  }

  // helper function: just make sure that tweet isn't a retweet
  function filterNewMedia(media: any[]) {
    return media.filter(
      (m) => !m.is_retweet || m.is_quote_with_media
    );
  }


  async function handleSearch(searchUrl: string) {
    resetSeenMedia(); // reset dedup on new search
    setLoading(true);
    setUsers([]);
    setPage(0);
    setHasMore(true);
    setError(null);

    if (!isValidTweetUrl(searchUrl)) { // url error handling
      setError({
        type: "input",
        message: "Please enter a valid Twitter/X post URL.",
      });
      setLoading(false);
      return;
    }

    const res = await fetch("/api/analyzeTweet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tweetUrl: searchUrl }),
    });

    const data = await res.json();

    if (!res.ok) { // invalid tweet id error handling
      setError({
        type: "search",
        message: data.error ?? "Tweet not found or unavailable.",
      });
      setLoading(false);
      return;
    }

    if ((data.id === "")) { // post's author is a protected account
      setError({
        type: "search",
        message: "This account is protected",
      });
    } else if ((data.users ?? []).length === 0) { // if account public but no retweeters error handling
      setError({
        type: "search",
        message: "No one has retweeted this post yet.",
      });
    }

    if (res.status === 429) { // 429 returned from route.ts if rate limit reached
      setError({
        type: "search",
        message: "Rate limit reached. Please wait a moment and try again.",
      });
      setLoading(false);
      return;
    }


    console.log("API response:", data);

    const feedMap = new Map<string, any[]>(
      (data.usersFeed ?? [])
        .map((f: any) => {
          const newMedia = filterNewMedia(f.media);
          return [f.user_id, newMedia] as [string, any[]];
        })
        .filter(([, media]: [string, any[]]) => media.length > 0)
    );

    
    // const feedMap = new Map<string, any[]>(
    //   (data.usersFeed ?? []).map((f: any) => [f.user_id, f.media] as [string, any[]])
    // );

    console.log(feedMap);

    setUsers(data.users ?? []);
    setHasMore(data.hasMore);
    setFeeds(feedMap);
    setLoading(false);
  }

  async function loadMore() {

    if (!tweetUrl || !hasMore || loading) return;

    setLoading(true);

    const nextPage = page + 1;

    const res = await fetch(
      `/api/analyzeTweet?page=${nextPage}&limit=5`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tweetUrl }),
      }
    );

    const data = await res.json();

    setUsers((prev) => [...prev, ...(data.users ?? [])]); // add more users without reloading 
    setFeeds((prev) => {
      const newMap = new Map(prev);
      (data.usersFeed ?? []).forEach((f: any) => {
        //newMap.set(f.user_id, f.media);
        newMap.set(f.user_id, filterNewMedia(f.media));
      });
      return newMap;
    });
    setHasMore(data.hasMore);
    setPage(nextPage);
    setLoading(false);
  }

  async function handleProfileClick(user: TwitterUser) {
    const userPosts = feeds.get(user.id);
    if (!userPosts || userPosts.length === 0) return;

    // many retweeter's most recent tweet is another retweet that belongs
    // to someone else- this filtering ensures we're recursing on an original
    // tweet/quote/reply by the retweeter when we click on their profile

    // first try finding posts that have retweets
    const candidate = userPosts.find(t => !t.is_retweet && t.public_metrics?.retweet_count > 0)
    ?? userPosts.find(t => !t.is_retweet)
    ?? null;

    if (!candidate) { // error handling for when clicked user doesnt have original tweets
      setError({
        type: "profile",
        message:
          "This user doesn’t have an original or quoted tweet to explore.",
      });
      return;
    }

    console.log(candidate);

    const newTweetUrl = `https://x.com/${user.username}/status/${candidate.id}`;

    setTweetUrl(newTweetUrl);
    handleSearch(newTweetUrl);
  }

  //const loadMoreRef = useInfiniteScroll(loadMore, hasMore, loading);

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="mx-auto max-w-md space-y-4">
        <div className="sticky top-0 bg-gray-50 z-10 pb-4 pt-4">
          <h1 className="text-xl font-semibold text-gray-900">
            Twitter Media Explorer
          </h1>

           {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 mt-4 mb-4 text-sm text-red-700">
                {error.message}
              </div>
            )}

          <input
            type="text"
            placeholder="Paste Twitter/X post URL"
            value={tweetUrl}
            onChange={(e) => setTweetUrl(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
          />

          <button
            onClick={() => handleSearch(tweetUrl)}
            disabled={loading}
            className="w-full rounded-lg bg-black py-2 mt-4 text-sm font-medium text-white disabled:opacity-50"
          >
            {loading ? "Loading..." : "Search"}
          </button>
        </div>

        {viewMoreUser && (
          <ViewMoreModal
            user={viewMoreUser}
            onClose={() => setViewMoreUser(null)}
          />
        )}


        <div className="grid gap-6 mt-6">
          {users.map((user) => (
            <ProfileCard onClick={() => handleProfileClick(user)} onViewMore={() => setViewMoreUser(user)} key={user.id} user={user} media={feeds.get(user.id) ?? []}/>
          ))}
        </div>

        <button
          hidden={!hasMore || users.length === 0}
          onClick={loadMore}
          disabled={loading}
          className="mt-6 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Loading..." : "Load more"}
        </button>

        {/* <div ref={loadMoreRef} className="h-10" />

        <p hidden={!loading} className="text-center text-sm text-gray-400 py-2">
          Loading more…
        </p> */}
        

      </div>
    </main>
  );

}


