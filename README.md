# 📈 Edge Trending API

![License](https://img.shields.io/github/license/sebilune/yt-trend-scraper-api)
![Repo Size](https://img.shields.io/github/repo-size/sebilune/yt-trend-scraper-api)
![Last Commit](https://img.shields.io/github/last-commit/sebilune/yt-trend-scraper-api)

A minimal scraping edge API that returns trending videos based on a query, sorted by view count in descending order.

This is a **Next.js** API, it uses zero external dependencies outside of Next itself. The entire API is contained within `api/search/route.ts`, making it easy to plug into existing projects.

**Why Vercel/Next?**

This API was tested across free platforms like [Cloudflare Workers](https://workers.cloudflare.com/), [Koyeb](https://koyeb.com/), and [Fly.io](https://fly.io/) without proxies or dedicated IPs. Only **Vercel** consistently returned valid results without hitting CAPTCHA. Its clean network made it the most dependable free option during testing, especially for lightweight, fast queries.

[![Try it](https://img.shields.io/badge/try--it-hoppscotch-blue?style=for-the-badge&logo=hoppscotch)](https://hopp.sh/r/TpAqdU8SPOI9)
[![Try it](https://img.shields.io/badge/try--it-postman-orange?style=for-the-badge&logo=postman)](https://www.postman.com/sebi-51246/scraper-demo/request/z7wfc4d/youtube-trending-api)

## Index

- [Features](#features)
- [Usage](#usage)
  - [/api/search](#apisearch)
- [Configuration](#configuration)
- [Installation](#installation)
- [Deployment](#deployment)
- [License](#license)

## Features

- An `/api/search` endpoint that scrapes YouTube search results
- **Returns** `JSON` with title, link, channel, thumbnail, and views
- **In-memory cache** speeds up repeated requests
- **Configurable settings** for cache TTL and min/max result limit

## Usage

1. A `GET` request is made to `/api/search` with a search term.
2. The server checks the in-memory cache; if a result exists, it returns cached data.
3. If no cache, it scrapes the YouTube search results page, extracts embedded `JSON` (`ytInitialData`), parses video info, and sorts by view count.
4. The result is cached and sent back as a `JSON` response.

### /api/search

Query parameters:

- `q`: Search term
- `limit` (optional): Number of results (defaults to 1, maximum defaults to 4, all configurable)

Example local request using `curl`:

```bash
curl "http://localhost:3000/api/search?q=lofi&limit=4"
```

Example response:

```bash
{
  "videos": [
    {
      "title": "Lofi Chill Beats",
      "link": "https://www.youtube.com/watch?v=abc123",
      "channel": "Lofi Girl",
      "thumbnail": "https://i.ytimg.com/vi/abc123/hqdefault.jpg",
      "views": 1250000
    },
    ...
  ]
}
```

Returned fields:

- `title`: Video title text
- `link`: Full YouTube video URL
- `channel`: Uploader’s name
- `thumbnail`: Thumbnail image URL
- `views`: View count as number

## Configuration

Config variables can be found at the start of `route.ts`:

```bash
// Query limiting
const DEFAULT_LIMIT = 1;
const MAX_LIMIT = 4;

// Caching
const CACHE_TTL = 12 * 60 * 60 * 1000; // 12 hours
```

This repository has the following `next.config.ts` file:

```bash
const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,DELETE,PATCH,POST,PUT",
          },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
          },
        ],
      },
    ];
  },
};
```

If you're integrating this API into your own Next.js project and plan to call it from the client for example, using `fetch()` or `axios()`, you'll need to enable CORS (Cross-Origin Resource Sharing) to avoid browser security errors.

By default, browsers block requests to your API if they’re not served from the same origin or don’t have the proper headers. To allow these requests, this config is needed.

You do _not_ need CORS if the API is only ever called from server-side code (e.g. getServerSideProps, API routes, server actions, cron jobs).

## Installation

**Clone the repository:**

```bash
git clone https://github.com/yourusername/yt-trend-scraper-api.git
cd yt-trend-scraper-api
```

**Install dependencies:**

```bash
npm install
```

**Test the development server**

```bash
npm run dev
```

Test `http://localhost:3000/search?q=test` to verify it’s running.

## Deployment

[![Deploy to Vercel](https://img.shields.io/badge/deploy%20to%20vercel-black?logo=vercel&style=for-the-badge)](https://vercel.com/import/project?template=https://github.com/sebilune/yt-trend-scraper-api)

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for more information.
