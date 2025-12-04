/**
 * Guestly Webhook Synchronization
 * Handles incoming webhook events from Guestly for two-way booking sync
 */

import { createClient } from '@/lib/supabase/server';
import { PROPERTY_MAP } from '@/integrations/guestly/client';
import type { GuestlyReservation } from '@/integrations/guestly/client';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface WebhookEvent {
  event_id?: string;
  event_type: string;
  data: any;
  timestamp?: string;
}

export interface ReservationCreatedEvent {
  event_type: 'reservation.created';
  data: GuestlyReservation;
}

export interface ReservationUpdatedEvent {
  event_type: 'reservation.updated';
  data: GuestlyReservation;
}

export interface ReservationCanceledEvent {
  event_type: 'reservation.canceled';
  data: GuestlyReservation;
}

export interface CalendarUpdatedEvent {
  event_type: 'listing.calendar.updated';
  data: {
    listingId: string;
    updatedDates?: string[];
  };
}

export interface SyncResult {
  success: boolean;
  bookingId?: string;
  error?: string;
  action?: 'created' | 'updated' | 'canceled' | 'skipped';
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Map Guestly listing ID to local property ID
 */
async function getLocalPropertyId(guestlyListingId: string): Promise<string | null> {
  // Reverse lookup in PROPERTY_MAP
  const propertyEntry = Object.entries(PROPERTY_MAP).find(
    ([_, id]) => id === guestlyListingId
  );

  if (!propertyEntry) {
    console.error(`No property mapping found for Guestly listing: ${guestlyListingId}`);
    return null;
  }

  const [slug] = propertyEntry;

  // Get property UUID from database
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('properties')
    .select('id')
    .eq('slug', slug)
    .single();

  if (error || !data) {
    console.error(`Error fetching property by slug ${slug}:`, error);
    return null;
  }

  return (data as any).id;
}

/**
 * Map Guestly reservation status to local booking status
 */
function mapGuestlyStatus(
  guestlyStatus: string
): 'pending' | 'confirmed' | 'cancelled' | 'completed' {
  const statusMap: Record<string, 'pending' | 'confirmed' | 'cancelled' | 'completed'> = {
    'inquiry': 'pending',
    'reserved': 'confirmed',
    'confirmed': 'confirmed',
    'canceled': 'cancelled',
    'declined': 'cancelled',
  };

  return statusMap[guestlyStatus] || 'pending';
}

/**
 * Map Guestly reservation status to payment status
 */
function mapGuestlyPaymentStatus(
  guestlyStatus: string
): 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' {
  // Guestly confirmed/reserved reservations typically have payment
  if (guestlyStatus === 'confirmed' || guestlyStatus === 'reserved') {
    return 'completed';
  }

  if (guestlyStatus === 'canceled' || guestlyStatus === 'declined') {
    return 'refunded';
  }

  return 'pending';
}

/**
 * Generate unique booking reference for Guestly imports
 */
function generateBookingReference(guestlyReservationId: string): string {
  // Format: GUESTLY-{timestamp}-{last-6-chars-of-id}
  const timestamp = Date.now().toString(36).toUpperCase();
  const idSuffix = guestlyReservationId.slice(-6).toUpperCase();
  return `GUESTLY-${timestamp}-${idSuffix}`;
}

/**
 * Calculate number of nights between dates
 */
function calculateNights(checkIn: string, checkOut: string): number {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Parse guest name into first and last name
 */
function parseGuestName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(' ');

  if (parts.length === 1) {
    return { firstName: parts[0], lastName: 'Guest' };
  }

  const firstName = parts[0];
  const lastName = parts.slice(1).join(' ');

  return { firstName, lastName };
}

// ============================================================================
// Check for Duplicate Bookings
// ============================================================================

/**
 * Check if booking already exists in database
 * Prevents duplicate imports from Guestly
 */
async function isDuplicateBooking(
  guestlyReservationId: string
): Promise<{ isDuplicate: boolean; existingBookingId?: string }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('bookings')
    .select('id')
    .eq('guestly_reservation_id', guestlyReservationId)
    .maybeSingle();

  if (error) {
    console.error('Error checking for duplicate booking:', error);
    return { isDuplicate: false };
  }

  // Type the data
  type BookingId = { id: string } | null;
  const typedData = data as BookingId;

  if (typedData) {
    return { isDuplicate: true, existingBookingId: typedData.id };
  }

  return { isDuplicate: false };
}

// ============================================================================
// Event Handlers
// ============================================================================

/**
 * Handle reservation.created event
 * Creates a new booking in local database from Guestly reservation
 */
export async function handleReservationCreated(
  reservation: GuestlyReservation
): Promise<SyncResult> {
  try {
    console.log(`Processing reservation.created for ${reservation._id}`);

    // Check for duplicates
    const { isDuplicate, existingBookingId } = await isDuplicateBooking(reservation._id);

    if (isDuplicate) {
      console.log(`Booking already exists for Guestly reservation ${reservation._id}`);
      return {
        success: true,
        bookingId: existingBookingId,
        action: 'skipped',
      };
    }

    // Get local property ID
    const propertyId = await getLocalPropertyId(reservation.listingId);

    if (!propertyId) {
      return {
        success: false,
        error: `Could not map Guestly listing ${reservation.listingId} to local property`,
      };
    }

    // Parse guest name
    const { firstName, lastName } = parseGuestName(reservation.guestName || 'Guest');

    // Calculate nights
    const nights = calculateNights(reservation.checkIn, reservation.checkOut);

    // Extract pricing info
    const totalAmount = reservation.money?.fareAccommodation || 0;
    const basePrice = totalAmount * 0.85; // Estimate base price as 85% of total
    const cleaningFee = totalAmount * 0.15; // Estimate cleaning fee as 15% of total
    const vat = totalAmount * 0.0; // VAT already included in Guestly pricing

    // Create booking in database
    const supabase = await createClient();

    const bookingData = {
      booking_reference: generateBookingReference(reservation._id),
      property_id: propertyId,
      booking_source: 'guestly',

      // Guest information
      guest_first_name: firstName,
      guest_last_name: lastName,
      guest_email: reservation.guestEmail || 'noemail@guestly.import',
      guest_phone: reservation.guestPhone || 'N/A',
      guest_country: 'Unknown', // Guestly doesn't always provide this
      guest_company: null,

      // Booking details
      check_in_date: reservation.checkIn,
      check_out_date: reservation.checkOut,
      adults: reservation.numberOfGuests || 1,
      children: 0,
      infants: 0,

      // Pricing
      nights,
      base_price: basePrice,
      discount: 0,
      cleaning_fee: cleaningFee,
      pet_fee: 0,
      subtotal: totalAmount,
      vat,
      total: totalAmount,

      // Special requests
      special_requests: reservation.notes || null,
      purpose_of_stay: null,
      has_pet: false,
      early_checkin: false,
      late_checkout: false,

      // Payment
      payment_status: mapGuestlyPaymentStatus(reservation.status),
      payment_method: 'guestly',
      stripe_payment_intent_id: null,
      stripe_charge_id: null,

      // Booking status
      status: mapGuestlyStatus(reservation.status),

      // GDPR consent (assume true for Guestly bookings)
      terms_accepted: true,
      privacy_accepted: true,
      marketing_consent: false,

      // Guestly sync tracking
      guestly_reservation_id: reservation._id,
      guestly_sync_status: 'synced',
      guestly_synced_at: new Date().toISOString(),

      // Timestamps
      created_at: reservation.createdAt || new Date().toISOString(),
      updated_at: reservation.updatedAt || new Date().toISOString(),
      confirmed_at: reservation.status === 'confirmed' ? new Date().toISOString() : null,
    };

    const { data, error } = await supabase
      .from('bookings')
      .insert(bookingData as any)
      .select('id')
      .single();

    if (error) {
      console.error('Error creating booking from Guestly reservation:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    console.log(`Successfully created booking ${(data as any).id} from Guestly reservation ${reservation._id}`);

    return {
      success: true,
      bookingId: (data as any).id,
      action: 'created',
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in handleReservationCreated:', error);

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Handle reservation.updated event
 * Updates existing booking from Guestly reservation changes
 */
export async function handleReservationUpdated(
  reservation: GuestlyReservation
): Promise<SyncResult> {
  try {
    console.log(`Processing reservation.updated for ${reservation._id}`);

    const supabase = await createClient();

    // Find existing booking by Guestly reservation ID
    const { data: existingBooking, error: fetchError } = await supabase
      .from('bookings')
      .select('id, booking_source')
      .eq('guestly_reservation_id', reservation._id)
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching existing booking:', fetchError);
      return {
        success: false,
        error: fetchError.message,
      };
    }

    // If booking doesn't exist, create it
    if (!existingBooking) {
      console.log(`Booking not found for Guestly reservation ${reservation._id}, creating new booking`);
      return handleReservationCreated(reservation);
    }

    // Only update bookings that originated from Guestly
    const bookingData = existingBooking as any;
    if (bookingData.booking_source !== 'guestly') {
      console.log(`Booking ${bookingData.id} originated from ${bookingData.booking_source}, skipping Guestly update`);
      return {
        success: true,
        bookingId: bookingData.id,
        action: 'skipped',
      };
    }

    // Parse guest name
    const { firstName, lastName } = parseGuestName(reservation.guestName || 'Guest');

    // Calculate nights
    const nights = calculateNights(reservation.checkIn, reservation.checkOut);

    // Extract pricing info
    const totalAmount = reservation.money?.fareAccommodation || 0;
    const basePrice = totalAmount * 0.85;
    const cleaningFee = totalAmount * 0.15;

    // Update booking
    const updateData = {
      guest_first_name: firstName,
      guest_last_name: lastName,
      guest_email: reservation.guestEmail || 'noemail@guestly.import',
      guest_phone: reservation.guestPhone || 'N/A',

      check_in_date: reservation.checkIn,
      check_out_date: reservation.checkOut,
      adults: reservation.numberOfGuests || 1,

      nights,
      base_price: basePrice,
      cleaning_fee: cleaningFee,
      subtotal: totalAmount,
      total: totalAmount,

      special_requests: reservation.notes || null,

      payment_status: mapGuestlyPaymentStatus(reservation.status),
      status: mapGuestlyStatus(reservation.status),

      guestly_sync_status: 'synced',
      updated_at: new Date().toISOString(),
    };

    const { error: updateError } = await supabase
      .from('bookings')
      // @ts-ignore - Supabase type issue with Guestly fields
      .update(updateData as any)
      .eq('id', bookingData.id);

    if (updateError) {
      console.error('Error updating booking from Guestly reservation:', updateError);
      return {
        success: false,
        error: updateError.message,
      };
    }

    console.log(`Successfully updated booking ${bookingData.id} from Guestly reservation ${reservation._id}`);

    return {
      success: true,
      bookingId: bookingData.id,
      action: 'updated',
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in handleReservationUpdated:', error);

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Handle reservation.canceled event
 * Marks booking as cancelled in local database
 */
export async function handleReservationCanceled(
  reservation: GuestlyReservation
): Promise<SyncResult> {
  try {
    console.log(`Processing reservation.canceled for ${reservation._id}`);

    const supabase = await createClient();

    // Find existing booking
    const { data: existingBooking, error: fetchError } = await supabase
      .from('bookings')
      .select('id, booking_source, status')
      .eq('guestly_reservation_id', reservation._id)
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching existing booking:', fetchError);
      return {
        success: false,
        error: fetchError.message,
      };
    }

    // If booking doesn't exist, log and skip
    if (!existingBooking) {
      console.log(`Booking not found for Guestly reservation ${reservation._id}, nothing to cancel`);
      return {
        success: true,
        action: 'skipped',
      };
    }

    // Only cancel bookings that originated from Guestly
    const bookingData = existingBooking as any;
    if (bookingData.booking_source !== 'guestly') {
      console.log(`Booking ${bookingData.id} originated from ${bookingData.booking_source}, skipping Guestly cancellation`);
      return {
        success: true,
        bookingId: bookingData.id,
        action: 'skipped',
      };
    }

    // Skip if already cancelled
    if (bookingData.status === 'cancelled') {
      console.log(`Booking ${bookingData.id} already cancelled`);
      return {
        success: true,
        bookingId: bookingData.id,
        action: 'skipped',
      };
    }

    // Update booking to cancelled
    const { error: updateError } = await supabase
      .from('bookings')
      // @ts-ignore - Supabase type issue with Guestly fields
      .update({
        status: 'cancelled',
        payment_status: 'refunded',
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        guestly_sync_status: 'synced',
      } as any)
      .eq('id', bookingData.id);

    if (updateError) {
      console.error('Error cancelling booking:', updateError);
      return {
        success: false,
        error: updateError.message,
      };
    }

    console.log(`Successfully cancelled booking ${bookingData.id} from Guestly reservation ${reservation._id}`);

    return {
      success: true,
      bookingId: bookingData.id,
      action: 'canceled',
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in handleReservationCanceled:', error);

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Handle listing.calendar.updated event
 * Clears availability cache when calendar changes in Guestly
 */
export async function handleCalendarUpdated(data: {
  listingId: string;
  updatedDates?: string[];
}): Promise<SyncResult> {
  try {
    console.log(`Processing listing.calendar.updated for listing ${data.listingId}`);

    // Note: Availability cache auto-refreshes every 3.5 minutes
    // No need to manually clear - background refresh will update soon
    console.log(`Availability cache will auto-refresh within 3.5 minutes for listing ${data.listingId}`);

    return {
      success: true,
      action: 'updated',
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in handleCalendarUpdated:', error);

    return {
      success: false,
      error: errorMessage,
    };
  }
}

// ============================================================================
// Main Webhook Event Router
// ============================================================================

/**
 * Route webhook event to appropriate handler
 */
export async function processWebhookEvent(event: WebhookEvent): Promise<SyncResult> {
  console.log(`Processing webhook event: ${event.event_type}`);

  switch (event.event_type) {
    case 'reservation.created':
      return handleReservationCreated(event.data as GuestlyReservation);

    case 'reservation.updated':
      return handleReservationUpdated(event.data as GuestlyReservation);

    case 'reservation.canceled':
    case 'reservation.cancelled': // Handle both spellings
      return handleReservationCanceled(event.data as GuestlyReservation);

    case 'listing.calendar.updated':
      return handleCalendarUpdated(event.data);

    default:
      console.log(`Unhandled webhook event type: ${event.event_type}`);
      return {
        success: true,
        action: 'skipped',
      };
  }
}
