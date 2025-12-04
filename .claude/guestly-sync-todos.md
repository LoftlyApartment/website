# Guestly Booking Sync Implementation

## Overview
Implement automatic synchronization of bookings to Guestly after successful Stripe payment.

## Todo List

### 1. Database Schema Updates
- [ ] Create migration to add Guestly sync tracking fields to bookings table
  - `guestly_reservation_id` (TEXT, nullable)
  - `guestly_sync_status` (TEXT, default 'pending', CHECK IN ('pending', 'synced', 'failed'))
  - `guestly_sync_error` (TEXT, nullable)
  - `guestly_synced_at` (TIMESTAMPTZ, nullable)
  - `guestly_sync_attempts` (INTEGER, default 0)
  - Add index on `guestly_reservation_id`
  - Add index on `guestly_sync_status`

### 2. Create Guestly Sync Helper Library
- [ ] Create `/Users/philippbernert/Desktop/LoftyV4/Website/lib/guestly/sync.ts` with:
  - `syncBookingToGuestly(bookingId: string)` - Main sync function
  - `retryFailedSync(bookingId: string)` - Retry mechanism
  - `mapBookingToGuestlyReservation(booking)` - Data mapper
  - `mapStatusToGuestly(status)` - Status mapper
  - Type definitions for sync operations
  - Error handling with exponential backoff
  - Test mode flag support

### 3. Update Stripe Webhook Handler
- [ ] Modify `/Users/philippbernert/Desktop/LoftyV4/Website/app/api/stripe/webhook/route.ts`:
  - Import Guestly sync functions
  - After successful payment_intent.succeeded, trigger Guestly sync
  - Fetch full booking details from database
  - Call `syncBookingToGuestly(bookingId)`
  - Handle sync errors gracefully (don't block booking confirmation)
  - Add comprehensive logging for sync operations

### 4. Error Handling & Retry Logic
- [ ] Implement in sync.ts:
  - Exponential backoff retry (3 attempts: 1s, 2s, 4s)
  - Track sync attempts in database
  - Log detailed error information
  - Mark sync status appropriately
  - Don't throw errors that would break webhook flow

### 5. Admin Notification System
- [ ] Create email notification helper for failed syncs:
  - Create `/Users/philippbernert/Desktop/LoftyV4/Website/lib/notifications/admin-alerts.ts`
  - Send email to admin when sync fails after all retries
  - Include booking details and error information
  - Use environment variable for admin email address

### 6. Testing & Validation
- [ ] Add test mode functionality:
  - Environment variable `GUESTLY_SYNC_ENABLED` (default: false for safety)
  - Environment variable `GUESTLY_TEST_MODE` for logging without actual API calls
  - Add detailed logging for all sync operations
  - Test with Stripe test mode webhooks

### 7. Documentation
- [ ] Create documentation for:
  - How sync flow works
  - Environment variables needed
  - Error handling approach
  - How to manually retry failed syncs
  - Status mapping between systems

## Priority Order
1. Database schema (migration)
2. Sync helper library
3. Webhook integration
4. Error handling & retry
5. Admin notifications
6. Testing setup
7. Documentation

## Notes
- All file paths must be absolute
- Don't block booking confirmation if Guestly sync fails
- Log everything for debugging
- Use existing Guestly client from `/Users/philippbernert/Desktop/LoftyV4/Website/integrations/guestly/client.ts`
