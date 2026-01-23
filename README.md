# Twitter Media Explorer

Live site URL: https://twitter-media-explorer.vercel.app/

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

Run the development server by either:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

I used twitterapi.io as a more cost-effective solution. The .env.local file is hidden from my repo to protect my twitter API key. Create your own .env.local file in the root directory of this project, and populate it with `TWITTERAPI_IO_KEY=[your API key, no quotes]` to run this project locally.

### How to use this app:
- Enter a twitter post link into the search bar
- The app will load a few profile cards, each containing a different retweeter along with some of their original media/tweets/quote tweets
- When you hit the bottom of the list of retweeters, there may be a "Load More" button which will load more profile cards if you click on it. You can keep doing this until the Load More button disappears, meaning no more retweeters are left to explore.
- If you click on the profile picture/username inside a profile card, it will redirect you to the user on x.com
- If you click on the profile card itself, the app will do a recursive search on that user's most recent original post- if the user has no original posts, the recursive search request will be ignored.
- If you click on a tile inside the media grid of a profile card, it will expand the media and show you some basic stats (i.e. number of likes, retweets, replies)
- If you click on the "View More" button inside a profile card, it will show you most of the media timeline of the user.

### Some bugs at the moment:
- Videos/GIFs are not playable inside the app at the moment, an error will redirect you to the actual tweet.
- Accurate media retrieval and stats depends on API. Sometimes the media grids/timeline may look emptier than expected and this is something I am looking into.
- Retweeter list may be shorter than the actual number of retweeters (could be API limitation)
- Looking into whether my deduplication is working as intended