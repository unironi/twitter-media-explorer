import { NextRequest, NextResponse } from "next/server";

// video proxy to allow videos to play inside app

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");

  if (!url) {
    return new NextResponse("Missing url", { status: 400 });
  }

  if (!url.startsWith("https://video.twimg.com/")) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const range = req.headers.get("range");

  const twitterRes = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      "Referer": "https://twitter.com/",
      ...(range ? { Range: range } : {}),
    },
  });

  if (!twitterRes.ok || !twitterRes.body) {
    return new NextResponse(null, { status: twitterRes.status });
  }

  const headers = new Headers();
  const passthrough = [
    "content-type",
    "content-length",
    "content-range",
    "accept-ranges",
  ];

  passthrough.forEach((h) => {
    const value = twitterRes.headers.get(h);
    if (value) headers.set(h, value);
  });

  headers.set("Cache-Control", "public, max-age=3600, immutable");

  return new NextResponse(twitterRes.body, {
    status: range ? 206 : 200,
    headers,
  });
}
