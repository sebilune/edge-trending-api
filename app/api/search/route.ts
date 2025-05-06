import { NextResponse } from "next/server";
import { scrapeYouTube, Video } from "@/utils/scraper";
import {
  RATE_LIMIT_ENABLED,
  RATE_LIMIT_MAX,
  RATE_LIMIT_WINDOW,
} from "@/config/ratelimit";
import { CACHE_TTL } from "@/config/cache";
import { DEFAULT_LIMIT, MAX_LIMIT } from "@/config/limit";

// In-memory cache: stores search results with timestamps.
const cache: Record<string, { timestamp: number; data: Video[] }> = {};

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
