"use client";

import { useState } from "react";
import { ProfileCard } from "./component/ProfileCard";
import { TwitterUser } from "@/lib/twitterProvider";

export default function Home() {
  const [tweetUrl, setTweetUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<TwitterUser[]>([]);

  async function handleSearch() {
    setLoading(true);

    const res = await fetch("/api/analyzeTweet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tweetUrl }),
    });

    const data = await res.json();
    console.log("API response:", data);

    setLoading(false);

    if (data.sampledUsers?.length) {
      setUsers(data.sampledUsers);
    } else {
      setUsers([]);
      console.log("No one has retweeted this yet.");
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="mx-auto max-w-md space-y-4">
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
          onClick={handleSearch}
          disabled={loading}
          className="w-full rounded-lg bg-black py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading ? "Loading..." : "Search"}
        </button>

        {/* Profile Cards */}
        <div className="space-y-4 pt-2">
          {users.map((user) => (
            <ProfileCard key={user.id} user={user} />
          ))}
        </div>
      </div>
    </main>
  );
}
