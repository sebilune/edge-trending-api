# yt-trend-scraper-api

A scraping API that returns trending videos based on a query. This is a **Next.js** project, designed purely as a lightweight back-end service. It uses zero external dependencies outside of Next itself. The entire API is contained within `api/route.ts`, making it simple to drop directly into another project.

This scraper is a custom-modified version of [scraper-edge](https://www.npmjs.com/package/scraper-edge). It’s designed for fast youtube scraping on cloud environments with zero dependencies and can be easily integrated into any existing Next.js project.

This project is:

- ✅ An `/api/search` endpoint that scrapes YouTube search results
- ✅ Configurable for cache TTL, rate limits, and max result limits
- ✅ Simple and lightweight

---

## Index

- [yt-trend-scraper-api](#yt-trend-scraper-api)
  - [Index](#index)
  - [Features](#features)
  - [How It Works](#how-it-works)
    - [/api/search](#apisearch)
  - [Configuration](#configuration)
  - [Installation \& Setup](#installation--setup)
  - [Deployment](#deployment)
  - [License](#license)

---

## Features

- **Scrapes YouTube search pages** and extracts video data
- **Returns `JSON` payload** with title, link, channel, thumbnail, and views
- **In-memory cache** speeds up repeated requests
- **Rate limiting** protects from abuse per IP
- **Configurable settings** for cache TTL, rate limits, and max result limit

---

## How It Works

1. A `GET` request is made to `/api/search` with a search term.
2. The server checks the in-memory cache; if a result exists, it returns cached data.
3. If no cache, it scrapes the YouTube search results page, extracts embedded `JSON` (`ytInitialData`), parses video info, and sorts by view count.
4. The result is cached and sent back as a `JSON` response.

### /api/search

Query parameters:

- `q` (required): Search term
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

---

## Configuration

Config variables can be found at the start of `route.ts`:

```bash
// Query limiting
export const DEFAULT_LIMIT = 1;
export const MAX_LIMIT = 4;

// Caching
export const CACHE_TTL = 12 * 60 * 60 * 1000; // 12 hours

// Rate limiting
export const RATE_LIMIT_ENABLED = true;
export const RATE_LIMIT_MAX = 20;
export const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
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

This is because if you're integrating this API into your own Next.js project and plan to call it from the client for example, using `fetch()` or `axios()`, you'll need to enable CORS (Cross-Origin Resource Sharing) to avoid browser security errors.

By default, browsers block requests to your API if they’re not served from the same origin or don’t have the proper headers. To allow these requests, this config is needed.

You do _not_ need CORS if the API is only ever called from server-side code (e.g. getServerSideProps, API routes, server actions, cron jobs).

---

## Installation & Setup

**Clone the repository:**

```bash
git clone https://github.com/yourusername/yt-trend-scraper-api.git
cd yt-trend-scraper-api
```

**Install dependencies:**

```bash
npm install
```

or

```bash
bun install
```

**Test the development server**

```bash
npm run dev
```

or

```bash
bun run dev
```

Test `http://localhost:3000search?q=test` to verify it’s running.

---

## Deployment

To deploy on Vercel:

1. Push your project to GitHub.
2. Connect the GitHub repository to Vercel.
3. Vercel detects the Next.js backend and sets up the build automatically.

More details: https://nextjs.org/docs/app/building-your-application/deploying

---

## License

MIT License  
© [sebilune](https://github.com/sebilune)
