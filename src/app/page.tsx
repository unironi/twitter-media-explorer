"use client";

import { useState } from "react";
import { ProfileCard } from "./component/ProfileCard";
import { TwitterUser } from "@/lib/twitterProvider";
import { useInfiniteScroll } from "./hooks/infiniteScroll";


export default function Home() {
  const [tweetUrl, setTweetUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<TwitterUser[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [feeds, setFeeds] = useState<Map<string, any[]>>(new Map());

  async function handleSearch(searchUrl: string) {
    setLoading(true);
    setUsers([]);
    setPage(0);
    setHasMore(true);

    const res = await fetch("/api/analyzeTweet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tweetUrl: searchUrl }),
    });

    const data = await res.json();

    console.log("API response:", data);
    
    const feedMap = new Map<string, any[]>(
      (data.usersFeed ?? []).map((f: any) => [f.user_id, f.media] as [string, any[]])
    );

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
        newMap.set(f.user_id, f.media);
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

    if (!candidate) {
      console.log("No viable tweet to recurse on");
      return;
    }

    console.log(candidate);

    const newTweetUrl = `https://x.com/${user.username}/status/${candidate.id}`;

    setTweetUrl(newTweetUrl);
    handleSearch(newTweetUrl);
  }

  const loadMoreRef = useInfiniteScroll(loadMore, hasMore, loading);
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="mx-auto max-w-md space-y-4">
        <div className="sticky top-0 bg-gray-50 z-10 pb-4 pt-4">
          <h1 className="text-xl font-semibold text-gray-900">
            Twitter Media Explorer
          </h1>

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

        <div className="grid gap-6 mt-6">
          {users.map((user) => (
            <ProfileCard onClick={() => handleProfileClick(user)} key={user.id} user={user} media={feeds.get(user.id) ?? []}/>
          ))}
        </div>

        <button
          hidden={!hasMore}
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


