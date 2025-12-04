/**
 * Guestly Webhook Test Payloads
 * Sample webhook events for testing the webhook endpoint
 */

import type { GuestlyReservation } from '@/integrations/guestly/client';

// ============================================================================
// Sample Reservation Data
// ============================================================================

export const sampleReservation: GuestlyReservation = {
  _id: '6580ab123456789012345678',
  listingId: '68e0da429e441d00129131d7', // Kantstrasse
  checkIn: '2025-12-01',
  checkOut: '2025-12-05',
  status: 'confirmed',
  guestName: 'John Smith',
  guestEmail: 'john.smith@example.com',
  guestPhone: '+49 30 12345678',
  numberOfGuests: 2,
  money: {
    fareAccommodation: 850.00,
    currency: 'EUR',
  },
  notes: 'Early check-in requested. Celebrating anniversary.',
  source: 'airbnb',
  confirmationCode: 'HMABCD123456',
  createdAt: '2025-11-19T10:00:00Z',
  updatedAt: '2025-11-19T10:00:00Z',
};

// ============================================================================
// Test Webhook Payloads
// ============================================================================

/**
 * reservation.created event
 * Triggered when a new booking is made in Guestly
 */
export const reservationCreatedPayload = {
  event_id: 'evt_test_created_001',
  event_type: 'reservation.created',
  timestamp: new Date().toISOString(),
  data: sampleReservation,
};

/**
 * reservation.updated event
 * Triggered when a booking is modified in Guestly
 */
export const reservationUpdatedPayload = {
  event_id: 'evt_test_updated_001',
  event_type: 'reservation.updated',
  timestamp: new Date().toISOString(),
  data: {
    ...sampleReservation,
    checkOut: '2025-12-06', // Extended by one day
    numberOfGuests: 3, // Added one guest
    money: {
      fareAccommodation: 1050.00,
      currency: 'EUR',
    },
    notes: 'Early check-in requested. Celebrating anniversary. Extended stay by 1 night.',
    updatedAt: new Date().toISOString(),
  },
};

/**
 * reservation.canceled event
 * Triggered when a booking is cancelled in Guestly
 */
export const reservationCanceledPayload = {
  event_id: 'evt_test_canceled_001',
  event_type: 'reservation.canceled',
  timestamp: new Date().toISOString(),
  data: {
    ...sampleReservation,
    status: 'canceled' as const,
    updatedAt: new Date().toISOString(),
  },
};

/**
 * listing.calendar.updated event
 * Triggered when availability/calendar changes in Guestly
 */
export const calendarUpdatedPayload = {
  event_id: 'evt_test_calendar_001',
  event_type: 'listing.calendar.updated',
  timestamp: new Date().toISOString(),
  data: {
    listingId: '68e0da429e441d00129131d7', // Kantstrasse
    updatedDates: [
      '2025-12-01',
      '2025-12-02',
      '2025-12-03',
      '2025-12-04',
      '2025-12-05',
    ],
  },
};

// ============================================================================
// Alternative Property Test Payloads
// ============================================================================

/**
 * Reservation for Hindenburgufer property
 */
export const hindenburguferReservationPayload = {
  event_id: 'evt_test_hindenburgufer_001',
  event_type: 'reservation.created',
  timestamp: new Date().toISOString(),
  data: {
    _id: '6580ab987654321098765432',
    listingId: '68e0da486cf6cf001162ee98', // Hindenburgufer
    checkIn: '2025-12-10',
    checkOut: '2025-12-15',
    status: 'confirmed',
    guestName: 'Maria Garcia',
    guestEmail: 'maria.garcia@example.com',
    guestPhone: '+34 91 1234567',
    numberOfGuests: 4,
    money: {
      fareAccommodation: 1200.00,
      currency: 'EUR',
    },
    notes: 'Traveling with children. Need crib.',
    source: 'booking.com',
    confirmationCode: 'BKNG98765432',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } as GuestlyReservation,
};

// ============================================================================
// Edge Case Test Payloads
// ============================================================================

/**
 * Reservation with minimal data
 */
export const minimalReservationPayload = {
  event_id: 'evt_test_minimal_001',
  event_type: 'reservation.created',
  timestamp: new Date().toISOString(),
  data: {
    _id: '6580ab111111111111111111',
    listingId: '68e0da429e441d00129131d7',
    checkIn: '2025-12-20',
    checkOut: '2025-12-22',
    status: 'inquiry',
    // Minimal data - no guest info, no pricing
  } as Partial<GuestlyReservation>,
};

/**
 * Reservation with single-name guest
 */
export const singleNameGuestPayload = {
  event_id: 'evt_test_singlename_001',
  event_type: 'reservation.created',
  timestamp: new Date().toISOString(),
  data: {
    _id: '6580ab222222222222222222',
    listingId: '68e0da429e441d00129131d7',
    checkIn: '2025-12-25',
    checkOut: '2025-12-27',
    status: 'confirmed',
    guestName: 'Madonna', // Single name
    guestEmail: 'madonna@example.com',
    guestPhone: '+1 555 0100',
    numberOfGuests: 1,
    money: {
      fareAccommodation: 400.00,
      currency: 'EUR',
    },
  } as GuestlyReservation,
};

/**
 * Unknown listing ID (should fail gracefully)
 */
export const unknownListingPayload = {
  event_id: 'evt_test_unknown_001',
  event_type: 'reservation.created',
  timestamp: new Date().toISOString(),
  data: {
    _id: '6580ab333333333333333333',
    listingId: 'unknown-listing-id-12345',
    checkIn: '2025-12-30',
    checkOut: '2026-01-02',
    status: 'confirmed',
    guestName: 'Test User',
    guestEmail: 'test@example.com',
    numberOfGuests: 2,
  } as GuestlyReservation,
};

// ============================================================================
// All Test Payloads Collection
// ============================================================================

export const allTestPayloads = {
  reservationCreated: reservationCreatedPayload,
  reservationUpdated: reservationUpdatedPayload,
  reservationCanceled: reservationCanceledPayload,
  calendarUpdated: calendarUpdatedPayload,
  hindenburguferReservation: hindenburguferReservationPayload,
  minimalReservation: minimalReservationPayload,
  singleNameGuest: singleNameGuestPayload,
  unknownListing: unknownListingPayload,
};

// ============================================================================
// Helper Function to Generate Test Signature
// ============================================================================

/**
 * Generate test webhook signature for local testing
 * Uses the same algorithm as the webhook verification
 */
export function generateTestSignature(
  payload: object,
  secret: string
): string {
  const crypto = require('crypto');
  const payloadString = JSON.stringify(payload);
  const signature = crypto
    .createHmac('sha256', secret)
    .update(payloadString)
    .digest('hex');

  return `sha256=${signature}`;
}
