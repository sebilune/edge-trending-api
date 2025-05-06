# yt-trend-scraper

A scraping api that returns trending videos based on a query. This is a **Next.js** project, designed purely as a lightweight back-end service. It uses zero external dependencies outside of Next itself. All front-end dependencies, files, and directories that Next provides have been stripped from this project.

This scraper is a custom-modified version of [scraper-edge](https://www.npmjs.com/package/scraper-edge). It’s designed for ease of deployment on **Vercel** or local environments and can be easily integrated into any existing Next.js project.

This project is:

- ✅ An `/api/search` endpoint that scrapes YouTube search results
- ✅ Configurable for cache TTL, rate limits, and max result limits
- ✅ Simple and lightweight

---

## Index

- [yt-trend-scraper](#yt-trend-scraper)
  - [Index](#index)
  - [Features](#features)
  - [How It Works](#how-it-works)
  - [Installation \& Setup](#installation--setup)
  - [Configuration](#configuration)
  - [Deployment](#deployment)
  - [License](#license)

---

## Features

- **Scrapes YouTube search pages** and extracts video data
- **Returns JSON payload** with title, link, channel, thumbnail, and views
- **In-memory cache** speeds up repeated requests
- **Rate limiting** protects from abuse per IP
- **Configurable settings** for cache TTL, rate limits, and max result limit

---

## How It Works

1. A GET request is made to `/api/search` with a search term.
2. The server checks the in-memory cache; if a result exists, it returns cached data.
3. If no cache, it scrapes the YouTube search results page, extracts embedded JSON (`ytInitialData`), parses video info, and sorts by view count.
4. The result is cached and sent back as a JSON response.

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

Config files are under `config/`:

- `ratelimit.ts` → Enable/disable rate limiting, adjust max requests per window
- `cache.ts` → Set the cache time-to-live (TTL)
- `limit.ts` → Set the default and maximum number of videos per request

---

## Installation & Setup

**Clone the repository:**

```bash
git clone https://github.com/yourusername/yt-trend-scraper.git
cd yt-trend-scraper
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
