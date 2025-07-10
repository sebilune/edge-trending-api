# 📈 Serverless Trending API

![License](https://img.shields.io/github/license/sebilune/serverless-trending-api)
![Code Size (bytes)](https://img.shields.io/github/languages/code-size/sebilune/serverless-trending-api)
![Repo Size](https://img.shields.io/github/repo-size/sebilune/serverless-trending-api)
![Last Commit](https://img.shields.io/github/last-commit/sebilune/serverless-trending-api)

A minimal scraping serverless API that returns trending videos based on a query, sorted by view count in descending order.

This is a **Next.js** API, it uses zero external dependencies outside of Next itself. The entire API is contained within `api/search/route.ts`, making it easy to plug into existing projects.

[![Try it](https://img.shields.io/badge/try--it-hoppscotch-blue?style=for-the-badge&logo=hoppscotch)](https://hopp.sh/r/y69mfyXkJGjB)
[![Try it](https://img.shields.io/badge/try--it-postman-orange?style=for-the-badge&logo=postman)](https://www.postman.com/sebi-51246/scraper-demo/request/z7wfc4d/youtube-trending-api)

[![Deploy to Vercel](https://img.shields.io/badge/deploy%20to%20vercel-black?logo=vercel&style=for-the-badge)](https://vercel.com/import/project?template=https://github.com/sebilune/yt-trend-scraper-api)

## Index

- [Features](#features)
- [Usage](#usage)
  - [/api/search](#apisearch)
- [Configuration](#configuration)
- [Installation](#installation)
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

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for more information.
