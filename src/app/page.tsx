"use client";

import { useState } from "react";

export default function Home() {
  const [tweetUrl, setTweetUrl] = useState("");
  const [loading, setLoading] = useState(false);

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

    if (!data.sampledUsers) {
      console.log("No one has retweeted this yet.");
    }
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Twitter Media Explorer</h1>

      <input
        type="text"
        placeholder="Paste Twitter/X post URL"
        value={tweetUrl}
        onChange={(e) => setTweetUrl(e.target.value)}
        style={{ width: "100%", padding: 8, marginBottom: 12 }}
      />

      <button onClick={handleSearch} disabled={loading}>
        {loading ? "Loading..." : "Search"}
      </button>

    </main>
  );
}
