/**
 * Cached Availability API Route
 *
 * GET /api/availability/cached
 *
 * Returns cached availability data for a property without hitting Guesty API.
 * This endpoint serves pre-fetched availability data that is automatically
 * refreshed every 3.5 minutes in the background.
 *
 * Query params:
 * - propertyId: string (e.g., 'kant', 'hinden')
 * - startDate: string (YYYY-MM-DD) - optional
 * - endDate: string (YYYY-MM-DD) - optional
 *
 * Returns:
 * {
 *   blockedDates: string[],
 *   cached: true,
 *   lastUpdated: number
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCachedBlockedDates, getCacheStatistics } from '@/lib/cache/availability-cache';

// ============================================================================
// Types
// ============================================================================

interface CachedAvailabilityResponse {
  blockedDates: string[];
  cached: true;
  lastUpdated: number | null;
  propertyId: string;
  dateRange?: {
    startDate: string;
    endDate: string;
  };
}

interface ErrorResponse {
  error: string;
  details?: string;
}

// ============================================================================
// Validation
// ============================================================================

/**
 * Validate date format (YYYY-MM-DD)
 */
function isValidDate(dateString: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) return false;

  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

/**
 * Validate query parameters
 */
function validateQueryParams(searchParams: URLSearchParams): {
  valid: boolean;
  error?: string;
  propertyId?: string;
  startDate?: string;
  endDate?: string;
} {
  const propertyId = searchParams.get('propertyId');

  if (!propertyId) {
    return { valid: false, error: 'propertyId query parameter is required' };
  }

  // Validate property ID
  const validPropertyIds = ['kant', 'hinden'];
  if (!validPropertyIds.includes(propertyId)) {
    return {
      valid: false,
      error: `Invalid propertyId. Must be one of: ${validPropertyIds.join(', ')}`
    };
  }

  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  // If date range is provided, validate both dates
  if (startDate || endDate) {
    if (!startDate || !endDate) {
      return {
        valid: false,
        error: 'Both startDate and endDate must be provided together'
      };
    }

    if (!isValidDate(startDate)) {
      return {
        valid: false,
        error: 'Invalid startDate format. Use YYYY-MM-DD'
      };
    }

    if (!isValidDate(endDate)) {
      return {
        valid: false,
        error: 'Invalid endDate format. Use YYYY-MM-DD'
      };
    }

    if (endDate < startDate) {
      return {
        valid: false,
        error: 'endDate must be after startDate'
      };
    }
  }

  return {
    valid: true,
    propertyId,
    startDate: startDate || undefined,
    endDate: endDate || undefined
  };
}

// ============================================================================
// API Handler
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Validate query parameters
    const validation = validateQueryParams(searchParams);
    if (!validation.valid) {
      const errorResponse: ErrorResponse = {
        error: validation.error || 'Validation failed'
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    const { propertyId, startDate, endDate } = validation;

    console.log(`[Cached Availability API] Fetching cached data for ${propertyId}${startDate && endDate ? ` from ${startDate} to ${endDate}` : ''}`);

    // Get blocked dates from cache
    const blockedDates = await getCachedBlockedDates(
      propertyId!,
      startDate,
      endDate
    );

    // Get cache statistics to include lastUpdated timestamp
    const stats = getCacheStatistics();
    const propertyStats = stats.properties.find(p => p.propertyId === propertyId);

    const lastUpdated = propertyStats?.lastFetched
      ? new Date(propertyStats.lastFetched).getTime()
      : null;

    // Build response
    const response: CachedAvailabilityResponse = {
      blockedDates,
      cached: true,
      lastUpdated,
      propertyId: propertyId!
    };

    // Include date range in response if provided
    if (startDate && endDate) {
      response.dateRange = { startDate, endDate };
    }

    console.log(`[Cached Availability API] Returning ${blockedDates.length} blocked dates for ${propertyId}`);

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, max-age=60, s-maxage=60', // Cache response for 1 minute
      }
    });

  } catch (error) {
    console.error('[Cached Availability API] Error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorResponse: ErrorResponse = {
      error: 'Failed to fetch cached availability',
      details: errorMessage
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

// ============================================================================
// OPTIONS handler for CORS
// ============================================================================

export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: {
        'Allow': 'GET, OPTIONS',
      },
    }
  );
}
