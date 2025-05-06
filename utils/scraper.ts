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
