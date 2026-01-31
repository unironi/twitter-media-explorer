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

### Limitations:
- Media retrieval is dependent on how often the user posts original media vs. retweets. The API can only fetch so many tweets at a time, so if a Twitter user mostly retweets and does not post much media within a time period, the media grid and timeline may be sparser than expected. As far as I know, there is no way to only fetch tweets containing media- each tweet needs to go through filtering/searching to check for media which is costly. I may look into web scraping for this.
- Looking into whether my deduplication is working as intended
