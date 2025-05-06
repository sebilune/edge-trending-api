import { NextResponse } from "next/server";
import { scrapeYouTube, Video } from "@/utils/scraper";

// In-memory cache object: stores search results keyed by the query string.
// Each entry holds a timestamp (when it was cached) and the scraped video data.
const cache: Record<string, { timestamp: number; data: Video[] }> = {};

// Cache time-to-live (TTL): 12 hours, in milliseconds.
const CACHE_TTL = 12 * 60 * 60 * 1000; // 12 hours

/**
 * Handles GET requests to /api/search.
 * Query parameters:
 *   - q: search term (string, required)
 *   - limit: number of videos to return (optional, default 1, max 8)
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");
  const limitParam = searchParams.get("limit");

  // Return a 400 error if the required 'q' parameter is missing.
  if (!q) {
    return NextResponse.json(
      { error: "q parameter is required" },
      { status: 400 }
    );
  }

  // Parse and clamp the requested limit.
  const limit = parseLimit(limitParam);

  const cached = cache[q];
  const now = Date.now();

  // If we have a fresh cached result (within TTL), return it immediately.
  if (cached && now - cached.timestamp < CACHE_TTL) {
    console.log("Serving from cache:", q);
    const limited = cached.data.slice(0, limit);
    return NextResponse.json({ videos: limited });
  }

  try {
    // Perform a fresh scrape if no valid cache is available.
    const videos = await scrapeYouTube(q);

    // Store the fresh result in the cache with the current timestamp.
    cache[q] = { timestamp: now, data: videos };

    const limited = videos.slice(0, limit);
    return NextResponse.json({ videos: limited });
  } catch (error) {
    // Log and return a 500 error if scraping fails.
    console.error("Error while scraping:", error);
    return NextResponse.json(
      { error: "An error occurred while scraping" },
      { status: 500 }
    );
  }
}

/**
 * Parses the 'limit' query parameter and ensures it’s a number between 1 and 8.
 * If invalid or missing, defaults to 1.
 */
function parseLimit(limitParam: string | null): number {
  const parsed = parseInt(limitParam ?? "", 10);
  return isNaN(parsed) ? 1 : Math.max(1, Math.min(parsed, 8));
}
