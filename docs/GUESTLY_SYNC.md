# Guestly Booking Sync Documentation

## Overview

The Guestly Booking Sync system automatically synchronizes confirmed bookings from the website to Guestly's property management system after successful Stripe payment completion.

## Features

- **Automatic Sync**: Bookings are synced to Guestly immediately after payment success
- **Non-Blocking**: Sync failures don't prevent booking confirmation
- **Retry Logic**: 3 automatic retry attempts with exponential backoff (1s, 2s, 4s)
- **Error Tracking**: All sync attempts and failures are logged in the database
- **Admin Alerts**: Email notifications sent to admins when syncs fail
- **Test Mode**: Dry-run capability for testing without actual API calls
- **Status Mapping**: Automatic mapping between website and Guestly reservation statuses

## Architecture

### Components

1. **Database Schema** (`supabase/migrations/`)
   - Tracking fields in `bookings` table
   - Helper functions for sync operations

2. **Sync Library** (`lib/guestly/sync.ts`)
   - Core sync logic
   - Data mapping and transformation
   - Retry mechanism with exponential backoff

3. **Notification System** (`lib/notifications/admin-alerts.ts`)
   - Email alerts for failed syncs
   - Admin notification templates

4. **Webhook Integration** (`app/api/stripe/webhook/route.ts`)
   - Triggers sync after successful payment
   - Non-blocking async execution

## Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     Stripe Payment Success                       │
│                    (payment_intent.succeeded)                    │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              Update Booking Status in Database                   │
│        (payment_status: completed, status: confirmed)           │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│         Trigger Guestly Sync (Non-Blocking/Async)               │
│              syncBookingToGuestly(bookingId)                     │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Check if Sync Enabled                         │
│             (GUESTLY_SYNC_ENABLED = true?)                       │
└──────────────┬──────────────────────────┬────────────────────────┘
         NO    │                          │ YES
               ▼                          ▼
          ┌────────┐         ┌────────────────────────┐
          │  Stop  │         │  Fetch Booking Details │
          └────────┘         └───────────┬────────────┘
                                         │
                                         ▼
                             ┌────────────────────────┐
                             │  Map to Guestly Format │
                             │  - Property ID lookup  │
                             │  - Guest information   │
                             │  - Date/price mapping  │
                             │  - Status conversion   │
                             └───────────┬────────────┘
                                         │
                                         ▼
                             ┌────────────────────────┐
                             │   Attempt #1: Sync     │
                             │  createReservation()   │
                             └───────────┬────────────┘
                                         │
                    ┌────────────────────┼──────────────────────┐
               SUCCESS                   │                   FAILED
                    │                    │                       │
                    ▼                    ▼                       ▼
         ┌─────────────────┐   ┌──────────────┐    ┌────────────────────┐
         │  Mark as Synced │   │  Wait 1 sec  │    │   Log Error        │
         │  Store Res. ID  │   │  Attempt #2  │    │   Increment Counter│
         └─────────────────┘   └──────┬───────┘    └──────────┬─────────┘
                                      │                        │
                                 ┌────┴─────┐                  │
                            SUCCESS      FAILED                │
                                │            │                 │
                                ▼            ▼                 │
                     ┌─────────────┐  ┌──────────────┐        │
                     │Mark as Synced│  │  Wait 2 sec  │        │
                     └─────────────┘  │  Attempt #3  │        │
                                      └──────┬───────┘        │
                                             │                │
                                        ┌────┴─────┐          │
                                   SUCCESS      FAILED        │
                                       │            │         │
                                       ▼            ▼         │
                            ┌─────────────┐  ┌────────────┐  │
                            │Mark as Synced│  │Mark Failed │  │
                            └─────────────┘  │Send Alert  │◀─┘
                                             └────────────┘
```

## Database Schema

### New Fields in `bookings` Table

```sql
guestly_reservation_id   TEXT              -- Guestly reservation ID
guestly_sync_status      TEXT              -- 'pending', 'synced', 'failed'
guestly_sync_error       TEXT              -- Error message if failed
guestly_synced_at        TIMESTAMPTZ       -- Timestamp of successful sync
guestly_sync_attempts    INTEGER           -- Number of sync attempts
```

### Indexes

```sql
idx_bookings_guestly_reservation_id  -- For lookups by Guestly ID
idx_bookings_guestly_sync_status     -- For filtering by sync status
idx_bookings_failed_syncs            -- For finding failed syncs to retry
```

## Environment Variables

### Required

```env
# Guestly API credentials
GUESTLY_API_KEY=your-guestly-api-key-here

# Enable/disable sync (default: false for safety)
GUESTLY_SYNC_ENABLED=true
```

### Optional

```env
# Test mode (logs without API calls)
GUESTLY_TEST_MODE=true

# Admin alert email for failures
ADMIN_ALERT_EMAIL=admin@example.com
```

## Status Mapping

| Website Status | Guestly Status |
|---------------|----------------|
| `pending`     | `inquiry`      |
| `confirmed`   | `confirmed`    |
| `cancelled`   | `canceled`     |
| `completed`   | `confirmed`    |

## Data Mapping

### Guest Information
- `guest_first_name` + `guest_last_name` → `guestName`
- `guest_email` → `guestEmail`
- `guest_phone` → `guestPhone`
- `adults` + `children` → `numberOfGuests`

### Booking Details
- `check_in_date` → `checkIn` (ISO date)
- `check_out_date` → `checkOut` (ISO date)
- `total` → `money.fareAccommodation`
- Currency hardcoded as `EUR`

### Special Information (stored in `notes`)
- Special requests
- Purpose of stay
- Company name (if provided)
- Number of children and infants
- Guest country
- Booking reference

### Property Mapping
Property UUIDs are mapped to Guestly listing IDs via property slug:

```typescript
{
  'kantstrasse': '68e0da429e441d00129131d7',
  'hindenburgufer': '68e0da486cf6cf001162ee98'
}
```

## Error Handling

### Retry Logic
1. **Attempt 1**: Immediate
2. **Attempt 2**: After 1 second delay
3. **Attempt 3**: After 2 second delay (4 seconds total)

Each attempt increments `guestly_sync_attempts` counter.

### Error States
- **Pending**: Not yet synced (initial state)
- **Synced**: Successfully synced to Guestly
- **Failed**: All retry attempts exhausted

### Admin Notifications
When a booking fails to sync after all retries:
- Email sent to `ADMIN_ALERT_EMAIL`
- Contains booking details and error message
- Requires manual intervention

## Testing

### Test Mode Setup

1. Enable test mode in `.env.local`:
```env
GUESTLY_SYNC_ENABLED=true
GUESTLY_TEST_MODE=true
```

2. Process a test payment through Stripe
3. Check console logs for sync payload
4. Verify database fields are updated

### Test Mode Behavior
- Logs all sync data without API calls
- Returns mock Guestly reservation ID
- Updates database as if sync succeeded
- Safe for development and testing

### Production Testing
1. Set `GUESTLY_SYNC_ENABLED=false` initially
2. Process real bookings normally
3. Review booking data in database
4. Enable sync when ready: `GUESTLY_SYNC_ENABLED=true`
5. Monitor first few bookings closely

## Manual Operations

### Retry Failed Sync

```typescript
import { retryFailedSync } from '@/lib/guestly/sync';

// Retry a specific booking
const result = await retryFailedSync('booking-uuid-here');

if (result.success) {
  console.log('Sync successful:', result.reservationId);
} else {
  console.error('Sync failed:', result.error);
}
```

### Get Sync Statistics

```typescript
import { getSyncStatistics } from '@/lib/guestly/sync';

const stats = await getSyncStatistics();
console.log(stats);
// { pending: 5, synced: 123, failed: 2 }
```

### Query Failed Syncs

```sql
SELECT
  id,
  booking_reference,
  guest_email,
  check_in_date,
  guestly_sync_error,
  guestly_sync_attempts
FROM bookings
WHERE guestly_sync_status = 'failed'
ORDER BY created_at DESC;
```

## Monitoring

### Key Metrics to Track
1. **Sync Success Rate**: `synced / (synced + failed)`
2. **Average Attempts**: Track how often retries are needed
3. **Common Errors**: Group by `guestly_sync_error`
4. **Sync Latency**: Time from payment to successful sync

### Logs to Monitor
- `✓ Guestly sync successful for booking [ID]: reservation [RES_ID]`
- `✗ Guestly sync failed for booking [ID]: [ERROR]`
- `Sync attempt [N] failed for booking [ID]`

### Database Queries

**Daily sync summary:**
```sql
SELECT
  DATE(created_at) as date,
  COUNT(*) FILTER (WHERE guestly_sync_status = 'synced') as synced,
  COUNT(*) FILTER (WHERE guestly_sync_status = 'failed') as failed,
  COUNT(*) FILTER (WHERE guestly_sync_status = 'pending') as pending
FROM bookings
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

## Troubleshooting

### Sync Not Triggering
1. Check `GUESTLY_SYNC_ENABLED=true` in environment
2. Verify Stripe webhook is working
3. Check webhook logs for payment events
4. Ensure booking update returned valid ID

### All Syncs Failing
1. Verify `GUESTLY_API_KEY` is correct
2. Test Guestly API connection separately
3. Check property mapping configuration
4. Review Guestly API rate limits

### Intermittent Failures
1. Check network/connectivity issues
2. Review Guestly API status
3. Verify retry logic is working
4. Check if specific properties fail more

### Data Mapping Issues
1. Verify property slug matches `PROPERTY_MAP`
2. Check guest data completeness
3. Ensure dates are in correct format (YYYY-MM-DD)
4. Validate price/currency fields

## Best Practices

1. **Start with Test Mode**: Always test with `GUESTLY_TEST_MODE=true` first
2. **Monitor Closely**: Watch first few production syncs carefully
3. **Set Up Alerts**: Configure `ADMIN_ALERT_EMAIL` for critical failures
4. **Regular Audits**: Periodically check failed syncs and retry manually
5. **Keep Logs**: Retain sync logs for at least 30 days
6. **Document Failures**: Track patterns in sync failures for improvement

## API Reference

### `syncBookingToGuestly(bookingId: string)`
Main sync function triggered after payment success.

**Returns**: `Promise<SyncResult>`
```typescript
{
  success: boolean;
  reservationId?: string;
  error?: string;
  attempts?: number;
}
```

### `retryFailedSync(bookingId: string)`
Manually retry a failed sync.

**Returns**: `Promise<SyncResult>`

### `getSyncStatistics()`
Get aggregated sync statistics.

**Returns**: `Promise<{ pending: number; synced: number; failed: number }>`

### `mapBookingToGuestlyReservation(booking: BookingData)`
Convert booking data to Guestly reservation format.

**Returns**: `Promise<ReservationData | null>`

### `mapStatusToGuestly(status: string)`
Map website status to Guestly status.

**Returns**: `'inquiry' | 'reserved' | 'confirmed' | 'canceled' | 'declined'`

## Support

For issues or questions:
1. Check logs in Vercel/server console
2. Query database for sync status
3. Review Guestly API documentation
4. Contact Guestly support for API issues

## Future Enhancements

Potential improvements to consider:
- [ ] Background job for periodic retry of failed syncs
- [ ] Admin dashboard for sync management
- [ ] Webhook from Guestly for bidirectional sync
- [ ] Sync cancellations and modifications
- [ ] Bulk sync utility for historical bookings
- [ ] More detailed sync analytics
