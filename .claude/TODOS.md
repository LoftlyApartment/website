# Guestly Booking Sync Implementation - Todo List

## Project Goal
Implement automatic synchronization of bookings to Guestly after successful Stripe payment completion.

## Tasks

### [ ] 1. Database Migration - Add Guestly Sync Fields
**Description**: Create migration to add Guestly sync tracking columns to bookings table
**Files**: Create `/Users/philippbernert/Desktop/LoftyV4/Website/supabase/migrations/20251119000001_add_guestly_sync_fields.sql`
**Details**:
- Add columns: guestly_reservation_id, guestly_sync_status, guestly_sync_error, guestly_synced_at, guestly_sync_attempts
- Add indexes for performance
- Use ALTER TABLE with IF NOT EXISTS

### [ ] 2. Create Guestly Sync Helper Library
**Description**: Build core sync functionality with mapping and error handling
**Files**: Create `/Users/philippbernert/Desktop/LoftyV4/Website/lib/guestly/sync.ts`
**Details**:
- syncBookingToGuestly() function
- retryFailedSync() function
- Data mapping functions
- Status mapping
- Exponential backoff retry logic
- Test mode support

### [ ] 3. Create Admin Notification System
**Description**: Email alerts for failed syncs
**Files**: Create `/Users/philippbernert/Desktop/LoftyV4/Website/lib/notifications/admin-alerts.ts`
**Details**:
- Send email on sync failures
- Include booking details and error info
- Use environment variable for admin email

### [ ] 4. Update Stripe Webhook Handler
**Description**: Integrate Guestly sync into payment success flow
**Files**: Modify `/Users/philippbernert/Desktop/LoftyV4/Website/app/api/stripe/webhook/route.ts`
**Details**:
- Import sync functions
- Trigger sync after payment_intent.succeeded
- Fetch booking details
- Call syncBookingToGuestly()
- Handle errors gracefully
- Add comprehensive logging

### [ ] 5. Testing & Documentation
**Description**: Add test mode and create documentation
**Files**: Update .env.example, create docs
**Details**:
- Environment variables: GUESTLY_SYNC_ENABLED, GUESTLY_TEST_MODE
- Document sync flow
- Document error handling
- Document manual retry process

## Current Status
Starting with Task 1: Database Migration

## Notes
- Use existing Guestly client from /Users/philippbernert/Desktop/LoftyV4/Website/integrations/guestly/client.ts
- All file paths must be absolute
- Don't block booking confirmation if sync fails
- Log everything for debugging
