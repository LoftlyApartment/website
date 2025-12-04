# Guestly Webhook Endpoint

This endpoint receives real-time webhook events from Guestly for two-way booking synchronization.

## Quick Start

### 1. Environment Variables

Add to `.env`:
```bash
GUESTLY_WEBHOOK_ENABLED=true
GUESTLY_WEBHOOK_SECRET=your-webhook-secret
GUESTLY_API_KEY=your-api-key
```

### 2. Configure in Guestly Dashboard

1. Go to Guestly Dashboard → Settings → Integrations → Webhooks
2. Add webhook URL: `https://your-domain.com/api/webhooks/guestly`
3. Subscribe to events:
   - `reservation.created`
   - `reservation.updated`
   - `reservation.canceled`
   - `listing.calendar.updated`
4. Copy webhook secret to `.env`

### 3. Test

```bash
# Local testing
npm run test-webhook reservationCreated

# Health check
curl https://your-domain.com/api/webhooks/guestly
```

## Supported Events

| Event | Description | Action |
|-------|-------------|--------|
| `reservation.created` | New booking in Guestly | Creates booking in database |
| `reservation.updated` | Booking modified | Updates existing booking |
| `reservation.canceled` | Booking cancelled | Marks booking as cancelled |
| `listing.calendar.updated` | Calendar changed | Clears availability cache |

## Security

- ✅ HMAC-SHA256 signature verification
- ✅ Request validation
- ✅ Duplicate prevention
- ✅ Source tracking
- ✅ Complete audit logging

## Monitoring

Check webhook logs:
```sql
SELECT * FROM webhook_logs
ORDER BY created_at DESC
LIMIT 50;
```

## Documentation

Full documentation: `/docs/GUESTLY_WEBHOOK_SETUP.md`

## Files

- `route.ts` - Webhook endpoint handler
- `/lib/guestly/webhook-sync.ts` - Event processing logic
- `/lib/guestly/webhook-test-payloads.ts` - Test data
- `/lib/guestly/test-webhook.ts` - Testing utility

## Support

For issues:
1. Check `webhook_logs` table
2. Review application logs
3. Test with sample payloads
4. Verify environment variables
