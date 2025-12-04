/**
 * Guestly Booking Synchronization
 * Automatically syncs bookings to Guestly after successful payment
 */

import { createClient } from '@/lib/supabase/server';
import { createReservation, PROPERTY_MAP } from '@/integrations/guestly/client';
import type { ReservationData, GuestlyReservation } from '@/integrations/guestly/client';
import { sendSyncFailureAlert } from '@/lib/notifications/admin-alerts';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface BookingData {
  id: string;
  booking_reference: string;
  property_id: string;

  // Guest information
  guest_first_name: string;
  guest_last_name: string;
  guest_email: string;
  guest_phone: string;
  guest_country: string;
  guest_company: string | null;

  // Booking details
  check_in_date: string;
  check_out_date: string;
  adults: number;
  children: number;
  infants: number;

  // Pricing
  total: number;

  // Special requests
  special_requests: string | null;
  purpose_of_stay: string | null;

  // Status
  status: string;
  payment_status: string;

  // Guestly sync tracking
  guestly_reservation_id: string | null;
  guestly_sync_status: string;
  guestly_sync_attempts: number;
}

export interface SyncResult {
  success: boolean;
  reservationId?: string;
  error?: string;
  attempts?: number;
}

// ============================================================================
// Configuration
// ============================================================================

const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAYS = [1000, 2000, 4000]; // Exponential backoff in ms

/**
 * Check if Guestly sync is enabled
 */
function isSyncEnabled(): boolean {
  return process.env.GUESTLY_SYNC_ENABLED === 'true';
}

/**
 * Check if running in test mode (logs without actual API calls)
 */
function isTestMode(): boolean {
  return process.env.GUESTLY_TEST_MODE === 'true';
}

// ============================================================================
// Property ID Mapping
// ============================================================================

/**
 * Map property UUID to Guestly listing ID
 * Uses property slug to find the correct Guestly ID
 */
async function getGuestlyListingId(propertyId: string): Promise<string | null> {
  const supabase = await createClient();

  const { data: property, error } = await supabase
    .from('properties')
    .select('slug')
    .eq('id', propertyId)
    .single();

  if (error || !property) {
    console.error('Error fetching property slug:', error);
    return null;
  }

  // Type the property data
  type PropertySlug = { slug: string } | null;
  const typedProperty = property as PropertySlug;

  if (!typedProperty) {
    return null;
  }

  // Map slug to Guestly listing ID
  const slug = typedProperty.slug as keyof typeof PROPERTY_MAP;
  return PROPERTY_MAP[slug] || null;
}

// ============================================================================
// Status Mapping
// ============================================================================

/**
 * Map website booking status to Guestly reservation status
 */
export function mapStatusToGuestly(
  websiteStatus: string
): 'inquiry' | 'reserved' | 'confirmed' | 'canceled' | 'declined' {
  const statusMap: Record<string, 'inquiry' | 'reserved' | 'confirmed' | 'canceled' | 'declined'> = {
    'pending': 'inquiry',
    'confirmed': 'confirmed',
    'cancelled': 'canceled',
    'completed': 'confirmed', // Keep as confirmed in Guestly
  };

  return statusMap[websiteStatus] || 'inquiry';
}

// ============================================================================
// Data Mapping
// ============================================================================

/**
 * Map booking data to Guestly reservation format
 */
export async function mapBookingToGuestlyReservation(
  booking: BookingData
): Promise<ReservationData | null> {
  // Get Guestly listing ID
  const listingId = await getGuestlyListingId(booking.property_id);

  if (!listingId) {
    console.error(`Could not map property ${booking.property_id} to Guestly listing`);
    return null;
  }

  // Build guest name
  const guestName = `${booking.guest_first_name} ${booking.guest_last_name}`;

  // Calculate total number of guests
  const numberOfGuests = booking.adults + booking.children;

  // Build notes with all relevant information
  const notes = [
    booking.special_requests,
    booking.purpose_of_stay ? `Purpose: ${booking.purpose_of_stay}` : null,
    booking.guest_company ? `Company: ${booking.guest_company}` : null,
    booking.children > 0 ? `Children: ${booking.children}` : null,
    booking.infants > 0 ? `Infants: ${booking.infants}` : null,
    `Country: ${booking.guest_country}`,
    `Booking Reference: ${booking.booking_reference}`,
  ]
    .filter(Boolean)
    .join('\n');

  // Map to Guestly format
  const reservationData: ReservationData = {
    listingId,
    checkIn: booking.check_in_date,
    checkOut: booking.check_out_date,
    guestName,
    guestEmail: booking.guest_email,
    guestPhone: booking.guest_phone,
    numberOfGuests,
    status: mapStatusToGuestly(booking.status),
    money: {
      fareAccommodation: Number(booking.total),
      currency: 'EUR',
    },
    notes,
    source: 'website',
  };

  return reservationData;
}

// ============================================================================
// Database Operations
// ============================================================================

/**
 * Update booking sync status in database
 */
async function updateSyncStatus(
  bookingId: string,
  status: 'pending' | 'synced' | 'failed',
  options: {
    reservationId?: string;
    error?: string;
    incrementAttempts?: boolean;
  } = {}
): Promise<void> {
  const supabase = await createClient();

  const updateData: any = {
    guestly_sync_status: status,
    guestly_sync_error: options.error || null,
  };

  if (options.reservationId) {
    updateData.guestly_reservation_id = options.reservationId;
    updateData.guestly_synced_at = new Date().toISOString();
  }

  if (options.incrementAttempts) {
    // Use raw SQL to increment attempts
    // @ts-ignore - Supabase type issue with RPC functions
    const { error } = await supabase.rpc('increment_sync_attempts', {
      booking_id: bookingId,
    });

    if (error) {
      console.error('Error incrementing sync attempts:', error);
    }
  }

  const { error } = await supabase
    .from('bookings')
    // @ts-ignore - Supabase type issue with Guestly fields
    .update(updateData)
    .eq('id', bookingId);

  if (error) {
    console.error('Error updating sync status:', error);
    throw error;
  }
}

/**
 * Fetch booking details from database
 */
async function fetchBooking(bookingId: string): Promise<BookingData | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', bookingId)
    .single();

  if (error) {
    console.error('Error fetching booking:', error);
    return null;
  }

  return data as BookingData;
}

// ============================================================================
// Sync Logic with Retry
// ============================================================================

/**
 * Attempt to sync booking to Guestly with retry logic
 */
async function attemptSync(
  booking: BookingData,
  attemptNumber: number
): Promise<GuestlyReservation | null> {
  console.log(`Sync attempt ${attemptNumber} for booking ${booking.id}`);

  // Map booking data to Guestly format
  const reservationData = await mapBookingToGuestlyReservation(booking);

  if (!reservationData) {
    throw new Error('Could not map booking data to Guestly format');
  }

  // Test mode: Log without actual API call
  if (isTestMode()) {
    console.log('TEST MODE: Would create Guestly reservation with data:', {
      bookingId: booking.id,
      bookingReference: booking.booking_reference,
      reservationData,
    });

    // Return mock reservation
    return {
      _id: 'test-reservation-id',
      listingId: reservationData.listingId,
      checkIn: reservationData.checkIn,
      checkOut: reservationData.checkOut,
      status: reservationData.status || 'confirmed',
      guestName: reservationData.guestName,
      guestEmail: reservationData.guestEmail,
      guestPhone: reservationData.guestPhone,
      numberOfGuests: reservationData.numberOfGuests,
    };
  }

  // Actual API call
  const reservation = await createReservation(reservationData);
  return reservation;
}

/**
 * Delay execution for retry with exponential backoff
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Sync booking to Guestly with automatic retry logic
 */
async function syncWithRetry(booking: BookingData): Promise<SyncResult> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRY_ATTEMPTS; attempt++) {
    try {
      // Update attempts counter
      await updateSyncStatus(booking.id, 'pending', {
        incrementAttempts: true,
      });

      // Attempt sync
      const reservation = await attemptSync(booking, attempt);

      if (reservation && reservation._id) {
        // Success!
        await updateSyncStatus(booking.id, 'synced', {
          reservationId: reservation._id,
        });

        console.log(`Successfully synced booking ${booking.id} to Guestly reservation ${reservation._id}`);

        return {
          success: true,
          reservationId: reservation._id,
          attempts: attempt,
        };
      }

    } catch (error) {
      lastError = error as Error;
      console.error(`Sync attempt ${attempt} failed for booking ${booking.id}:`, error);

      // If not the last attempt, wait before retrying
      if (attempt < MAX_RETRY_ATTEMPTS) {
        const delayMs = RETRY_DELAYS[attempt - 1];
        console.log(`Waiting ${delayMs}ms before retry...`);
        await delay(delayMs);
      }
    }
  }

  // All attempts failed
  const errorMessage = lastError?.message || 'Unknown error during sync';

  await updateSyncStatus(booking.id, 'failed', {
    error: errorMessage,
  });

  console.error(`Failed to sync booking ${booking.id} after ${MAX_RETRY_ATTEMPTS} attempts`);

  return {
    success: false,
    error: errorMessage,
    attempts: MAX_RETRY_ATTEMPTS,
  };
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Main sync function: Sync a booking to Guestly
 * Called after successful payment
 */
export async function syncBookingToGuestly(bookingId: string): Promise<SyncResult> {
  try {
    console.log(`Starting Guestly sync for booking ${bookingId}`);

    // Check if sync is enabled
    if (!isSyncEnabled()) {
      console.log('Guestly sync is disabled via GUESTLY_SYNC_ENABLED environment variable');
      return {
        success: false,
        error: 'Sync disabled',
      };
    }

    // Fetch booking details
    const booking = await fetchBooking(bookingId);

    if (!booking) {
      const error = 'Booking not found';
      console.error(error);
      return {
        success: false,
        error,
      };
    }

    // Check if already synced
    if (booking.guestly_sync_status === 'synced' && booking.guestly_reservation_id) {
      console.log(`Booking ${bookingId} already synced to Guestly reservation ${booking.guestly_reservation_id}`);
      return {
        success: true,
        reservationId: booking.guestly_reservation_id,
      };
    }

    // Perform sync with retry logic
    const result = await syncWithRetry(booking);

    // If sync failed after all retries, send admin notification
    if (!result.success) {
      try {
        await sendSyncFailureAlert(booking, result.error || 'Unknown error');
      } catch (notificationError) {
        console.error('Failed to send admin notification:', notificationError);
        // Don't throw - we don't want notification failures to cause issues
      }
    }

    return result;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in syncBookingToGuestly:', error);

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Retry a failed sync manually
 * Useful for admin tools or background jobs
 */
export async function retryFailedSync(bookingId: string): Promise<SyncResult> {
  console.log(`Manually retrying sync for booking ${bookingId}`);

  // Fetch booking
  const booking = await fetchBooking(bookingId);

  if (!booking) {
    return {
      success: false,
      error: 'Booking not found',
    };
  }

  // Check current status
  if (booking.guestly_sync_status === 'synced') {
    return {
      success: true,
      reservationId: booking.guestly_reservation_id || undefined,
    };
  }

  // Reset attempts counter
  const supabase = await createClient();
  await supabase
    .from('bookings')
    // @ts-ignore - Supabase type issue with Guestly fields
    .update({ guestly_sync_attempts: 0 })
    .eq('id', bookingId);

  // Retry sync
  return syncBookingToGuestly(bookingId);
}

/**
 * Get sync statistics for monitoring
 */
export async function getSyncStatistics(): Promise<{
  pending: number;
  synced: number;
  failed: number;
}> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('bookings')
    .select('guestly_sync_status');

  if (error) {
    console.error('Error fetching sync statistics:', error);
    return { pending: 0, synced: 0, failed: 0 };
  }

  const stats = {
    pending: 0,
    synced: 0,
    failed: 0,
  };

  data.forEach((booking: any) => {
    const status = booking.guestly_sync_status || 'pending';
    if (status in stats) {
      stats[status as keyof typeof stats]++;
    }
  });

  return stats;
}
