/**
 * OAuth Token Cache for Guesty API
 *
 * Manages OAuth 2.0 access tokens with automatic expiration and refresh.
 * Uses in-memory singleton pattern for server-side caching.
 *
 * Token Lifecycle:
 * - Tokens are cached for 24 hours (86400 seconds)
 * - Auto-refresh when expired or missing
 * - Thread-safe with concurrent request handling
 */

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface OAuthToken {
  access_token: string;
  token_type: string;
  expires_in: number; // Seconds until expiration
  expires_at: number; // Unix timestamp when token expires
  scope?: string;
}

export interface TokenCacheEntry {
  token: OAuthToken;
  cachedAt: number; // Unix timestamp when cached
  expiresAt: number; // Unix timestamp when expires
}

// ============================================================================
// Cache Storage (Singleton)
// ============================================================================

class OAuthTokenCache {
  private cache: TokenCacheEntry | null = null;
  private refreshPromise: Promise<OAuthToken> | null = null;

  /**
   * Get cached token if valid
   * @returns Cached token or null if expired/missing
   */
  getToken(): OAuthToken | null {
    if (!this.cache) {
      return null;
    }

    const now = Date.now();
    const timeUntilExpiry = this.cache.expiresAt - now;

    // Consider token expired if less than 5 minutes remaining
    // This provides a buffer to prevent using a token that expires mid-request
    const EXPIRY_BUFFER_MS = 5 * 60 * 1000; // 5 minutes

    if (timeUntilExpiry < EXPIRY_BUFFER_MS) {
      console.log('[OAuth Cache] Token expired or expiring soon, clearing cache');
      this.cache = null;
      return null;
    }

    console.log(`[OAuth Cache] Token valid for ${Math.round(timeUntilExpiry / 1000 / 60)} more minutes`);
    return this.cache.token;
  }

  /**
   * Store token in cache
   * @param token - OAuth token to cache
   */
  setToken(token: OAuthToken): void {
    const now = Date.now();
    const expiresAt = now + (token.expires_in * 1000);

    this.cache = {
      token,
      cachedAt: now,
      expiresAt
    };

    console.log(`[OAuth Cache] Token cached, expires at ${new Date(expiresAt).toISOString()}`);
  }

  /**
   * Clear cached token
   */
  clearToken(): void {
    this.cache = null;
    console.log('[OAuth Cache] Token cache cleared');
  }

  /**
   * Check if token is valid
   * @returns Boolean indicating if cached token exists and is valid
   */
  isTokenValid(): boolean {
    return this.getToken() !== null;
  }

  /**
   * Get token statistics for monitoring
   */
  getStatistics(): {
    hasCachedToken: boolean;
    timeUntilExpiry: number | null; // Milliseconds
    expiresAt: string | null; // ISO date string
  } {
    if (!this.cache) {
      return {
        hasCachedToken: false,
        timeUntilExpiry: null,
        expiresAt: null
      };
    }

    const now = Date.now();
    const timeUntilExpiry = this.cache.expiresAt - now;

    return {
      hasCachedToken: true,
      timeUntilExpiry: timeUntilExpiry > 0 ? timeUntilExpiry : 0,
      expiresAt: new Date(this.cache.expiresAt).toISOString()
    };
  }

  /**
   * Set the refresh promise (for concurrent request handling)
   */
  setRefreshPromise(promise: Promise<OAuthToken>): void {
    this.refreshPromise = promise;
  }

  /**
   * Get the refresh promise (for concurrent request handling)
   */
  getRefreshPromise(): Promise<OAuthToken> | null {
    return this.refreshPromise;
  }

  /**
   * Clear the refresh promise
   */
  clearRefreshPromise(): void {
    this.refreshPromise = null;
  }
}

// ============================================================================
// Global Cache for Serverless (Vercel) - persists across warm invocations
// ============================================================================

// Use globalThis to persist cache across warm serverless invocations
// This is a workaround for serverless environments where module-level
// singletons are recreated on cold starts but persist during warm starts
declare global {
  // eslint-disable-next-line no-var
  var __oauthTokenCache: OAuthTokenCache | undefined;
}

// Create or reuse the singleton instance
const tokenCache = globalThis.__oauthTokenCache ?? new OAuthTokenCache();

// Store in globalThis for persistence across warm invocations
if (process.env.NODE_ENV !== 'development') {
  globalThis.__oauthTokenCache = tokenCache;
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Get valid OAuth token from cache
 * @returns Cached token or null if expired/missing
 */
export function getCachedToken(): OAuthToken | null {
  return tokenCache.getToken();
}

/**
 * Store OAuth token in cache
 * @param token - OAuth token to cache
 */
export function setCachedToken(token: OAuthToken): void {
  tokenCache.setToken(token);
}

/**
 * Clear cached OAuth token
 */
export function clearCachedToken(): void {
  tokenCache.clearToken();
}

/**
 * Check if cached token is valid
 * @returns Boolean indicating if token exists and is not expired
 */
export function isTokenValid(): boolean {
  return tokenCache.isTokenValid();
}

/**
 * Get cache statistics for monitoring
 */
export function getCacheStatistics(): {
  hasCachedToken: boolean;
  timeUntilExpiry: number | null;
  expiresAt: string | null;
} {
  return tokenCache.getStatistics();
}

/**
 * Set refresh promise (for concurrent request handling)
 * When multiple requests need a token simultaneously, only one should
 * actually make the OAuth request. Others should wait for it.
 */
export function setRefreshPromise(promise: Promise<OAuthToken>): void {
  tokenCache.setRefreshPromise(promise);
}

/**
 * Get refresh promise (for concurrent request handling)
 */
export function getRefreshPromise(): Promise<OAuthToken> | null {
  return tokenCache.getRefreshPromise();
}

/**
 * Clear refresh promise
 */
export function clearRefreshPromise(): void {
  tokenCache.clearRefreshPromise();
}

// ============================================================================
// Exports
// ============================================================================

export default {
  getCachedToken,
  setCachedToken,
  clearCachedToken,
  isTokenValid,
  getCacheStatistics,
  setRefreshPromise,
  getRefreshPromise,
  clearRefreshPromise
};
