/**
 * rateLimitConfig.ts
 *
 * This file controls the rate limiting behavior for the API.
 *
 * To turn rate limiting ON or OFF, change RATE_LIMIT_ENABLED.
 * To adjust how many requests are allowed and how often, modify RATE_LIMIT_MAX and RATE_LIMIT_WINDOW.
 */

export const RATE_LIMIT_ENABLED = true; // Set to false to disable rate limiting

export const RATE_LIMIT_MAX = 20; // Max number of requests allowed per window

export const RATE_LIMIT_WINDOW = 60 * 1000; // Time window for rate limiting (in milliseconds); here: 1 minute
