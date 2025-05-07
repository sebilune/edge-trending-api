import { NextResponse } from "next/server";

// ▄▀▀ ▄▀▄ █▄ █ █▀ █ ▄▀
// ▀▄▄ ▀▄▀ █ ▀█ █▀ █ ▀▄█

// Query limiting
export const DEFAULT_LIMIT = 1; // Default number of videos to return if not specified
export const MAX_LIMIT = 4; // Maximum number of videos a user can request

// Caching
export const CACHE_TTL = 12 * 60 * 60 * 1000; // Cache time-to-live (in milliseconds); here: 12 hours

// Rate limiting
export const RATE_LIMIT_ENABLED = true; // Set to false to disable rate limiting
export const RATE_LIMIT_MAX = 20; // Max number of requests allowed per window
export const RATE_LIMIT_WINDOW = 60 * 1000; // Time window for rate limiting (in milliseconds); here: 1 minute

// In-memory cache: stores search results with timestamps.
const cache: Record<string, { timestamp: number; data: Video[] }> = {};

// ▄▀▀ ▄▀▀ █▀▄ ▄▀▄ █▀▄ ██▀ █▀▄
// ▄█▀ ▀▄▄ █▀▄ █▀█ █▀  █▄▄ █▀▄

/**
 * Type definition for a single YouTube video item.
 */
export type Video = {
  title: string;
  link: string;
  channel: string;
  thumbnail: string;
  views: number;
};

/**
 * Scrapes YouTube search results page for the given query.
 * Extracts and returns an array of videos, sorted by view count.
 */
export async function scrapeYouTube(query: string): Promise<Video[]> {
  const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(
    query
  )}`;

  // Fetch YouTube search results page with a desktop User-Agent.
  const res = await fetch(searchUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    },
  });

  const html = await res.text();

  // Locate the embedded ytInitialData JSON blob.
  const initialDataMarker = "var ytInitialData = ";
  const startIdx = html.indexOf(initialDataMarker);
  const endIdx = html.indexOf(";</script>", startIdx);

  if (startIdx === -1 || endIdx === -1) {
    console.log("DEBUG HTML HEAD:", html.slice(0, 500));
    throw new Error("Failed to locate ytInitialData");
  }

  const jsonData = html.substring(startIdx + initialDataMarker.length, endIdx);
  const parsed = JSON.parse(jsonData);

  // Navigate the JSON structure to reach the list of search results.
  const contents =
    parsed.contents?.twoColumnSearchResultsRenderer?.primaryContents
      ?.sectionListRenderer?.contents[0]?.itemSectionRenderer?.contents;

  if (!contents || !Array.isArray(contents)) {
    throw new Error("Failed to extract video contents");
  }

  const videos: Video[] = [];

  // Loop through each search result item and extract video details.
  for (const item of contents) {
    const videoRenderer = item.videoRenderer;
    if (videoRenderer) {
      const title = videoRenderer.title.runs[0].text;
      const videoId = videoRenderer.videoId;
      const link = `https://www.youtube.com/watch?v=${videoId}`;
      const channel = videoRenderer.ownerText?.runs[0]?.text || "Unknown";
      const thumbnail = videoRenderer.thumbnail?.thumbnails?.pop()?.url || "";
      const viewsText = videoRenderer.viewCountText?.simpleText || "0 views";
      const views = parseInt(viewsText.replace(/\D/g, "")) || 0;

      videos.push({
        title,
        link,
        channel,
        thumbnail,
        views,
      });
    }
  }

  // Return videos sorted by view count (highest first).
  return videos.sort((a, b) => b.views - a.views);
}

// In-memory rate limiter: maps IP → { count, lastReset }
const rateLimit: Record<string, { count: number; lastReset: number }> = {};

/**
 * Handles GET requests to /api/search.
 * Query parameters:
 *   - q: search term (required)
 *   - limit: number of results (optional, default DEFAULT_LIMIT, max MAX_LIMIT)
 */
export async function GET(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";

  // Apply rate limiting only if enabled in config
  if (RATE_LIMIT_ENABLED) {
    const now = Date.now();
    const entry = rateLimit[ip] || { count: 0, lastReset: now };

    // If the window has passed, reset the count
    if (now - entry.lastReset > RATE_LIMIT_WINDOW) {
      entry.count = 0;
      entry.lastReset = now;
    }

    entry.count += 1;
    rateLimit[ip] = entry;

    // If over the max allowed requests, block with 429
    if (entry.count > RATE_LIMIT_MAX) {
      return NextResponse.json(
        {
          error: `Rate limit exceeded. Max ${RATE_LIMIT_MAX} requests per ${
            RATE_LIMIT_WINDOW / 1000
          } seconds.`,
        },
        { status: 429 }
      );
    }
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");
  const limitParam = searchParams.get("limit");

  // Check if query param 'q' exists; if not, return 400 error
  if (!q) {
    return NextResponse.json(
      { error: "q parameter is required" },
      { status: 400 }
    );
  }

  // Parse 'limit' parameter, ensuring it's between 1 and MAX_LIMIT
  const limit = parseLimit(limitParam);

  // Check if cached result exists and is still valid (within TTL)
  const cached = cache[q];
  const now = Date.now();

  if (cached && now - cached.timestamp < CACHE_TTL) {
    console.log("Serving from cache:", q);
    const limited = cached.data.slice(0, limit); // Return only up to 'limit' items
    return NextResponse.json({ videos: limited });
  }

  try {
    // Perform fresh scrape if no valid cache
    const videos = await scrapeYouTube(q);
    // Store new result in cache with timestamp
    cache[q] = { timestamp: now, data: videos };
    const limited = videos.slice(0, limit); // Return only up to 'limit' items
    return NextResponse.json({ videos: limited });
  } catch (error) {
    // Handle scraping errors gracefully
    console.error("Error while scraping:", error);
    return NextResponse.json(
      { error: "An error occurred while scraping" },
      { status: 500 }
    );
  }
}

/**
 * Parses the 'limit' query parameter and ensures it’s a number between 1 and MAX_LIMIT.
 * Defaults to DEFAULT_LIMIT if not set or invalid.
 */
function parseLimit(limitParam: string | null): number {
  const parsed = parseInt(limitParam ?? "", 10);
  return isNaN(parsed)
    ? DEFAULT_LIMIT
    : Math.max(1, Math.min(parsed, MAX_LIMIT));
}
