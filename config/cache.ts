/**
 * cacheConfig.ts
 *
 * This file controls the caching behavior for the API.
 *
 * To change how long cached search results stay valid, modify CACHE_TTL.
 * To adjust the maximum number of cached entries (if needed), add CACHE_MAX_SIZE or similar.
 */

export const CACHE_TTL = 12 * 60 * 60 * 1000; // Cache time-to-live (in milliseconds); here: 12 hours
