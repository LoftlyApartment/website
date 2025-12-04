# Guestly Sync - Quick Start Guide

## Setup (5 minutes)

### 1. Database Migration
Run the migrations to add sync tracking fields:

```bash
# If using Supabase CLI
supabase db push

# Or apply migrations manually in Supabase dashboard
# Files: supabase/migrations/20251119000001_add_guestly_sync_fields.sql
#        supabase/migrations/20251119000002_add_sync_helper_functions.sql
```

### 2. Environment Variables
Add to your `.env.local`:

```env
# Required
GUESTLY_API_KEY=your-actual-api-key-here

# Enable sync (start with false for safety)
GUESTLY_SYNC_ENABLED=false

# Test mode (logs without API calls)
GUESTLY_TEST_MODE=true

# Admin alerts (optional but recommended)
ADMIN_ALERT_EMAIL=your-email@example.com
```

### 3. Test with Test Mode

```env
GUESTLY_SYNC_ENABLED=true
GUESTLY_TEST_MODE=true
```

1. Process a test booking payment
2. Check console for sync logs
3. Verify database fields populated

### 4. Enable Production

Once testing is successful:

```env
GUESTLY_SYNC_ENABLED=true
GUESTLY_TEST_MODE=false
```

## How It Works

```
Payment Success → Update Booking → Sync to Guestly (async)
                                    ├─ Success: Store reservation ID
                                    └─ Failure: Retry 3x → Email admin
```

## Verify Sync Status

```sql
-- Check sync status of recent bookings
SELECT
  booking_reference,
  guest_email,
  guestly_sync_status,
  guestly_reservation_id,
  guestly_sync_attempts,
  guestly_synced_at
FROM bookings
WHERE created_at > NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;
```

## Manual Retry

```typescript
import { retryFailedSync } from '@/lib/guestly/sync';

await retryFailedSync('booking-uuid-here');
```

## Monitoring

Watch for these log messages:
- `✓ Guestly sync successful for booking [ID]`
- `✗ Guestly sync failed for booking [ID]`

## Files Modified/Created

### Created
- `/supabase/migrations/20251119000001_add_guestly_sync_fields.sql`
- `/supabase/migrations/20251119000002_add_sync_helper_functions.sql`
- `/lib/guestly/sync.ts`
- `/lib/notifications/admin-alerts.ts`
- `/docs/GUESTLY_SYNC.md`
- `/docs/GUESTLY_SYNC_QUICKSTART.md`

### Modified
- `/app/api/stripe/webhook/route.ts` - Added sync trigger
- `/.env.example` - Added new environment variables

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Sync not triggering | Check `GUESTLY_SYNC_ENABLED=true` |
| All syncs failing | Verify `GUESTLY_API_KEY` is correct |
| Test mode not working | Check console logs for sync payloads |
| No admin emails | Set `ADMIN_ALERT_EMAIL` in environment |

## Support

See full documentation: `/docs/GUESTLY_SYNC.md`

## Safety Features

- ✅ Non-blocking (doesn't prevent booking confirmation)
- ✅ Automatic retries (3 attempts with backoff)
- ✅ Admin alerts on failure
- ✅ Test mode for safe testing
- ✅ Disabled by default
- ✅ Comprehensive error logging
