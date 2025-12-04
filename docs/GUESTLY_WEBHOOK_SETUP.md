# Guestly Webhook Integration Guide

Complete guide for setting up two-way booking synchronization between your website and Guestly using webhooks.

## Table of Contents

1. [Overview](#overview)
2. [How Two-Way Sync Works](#how-two-way-sync-works)
3. [Setup Instructions](#setup-instructions)
4. [Environment Variables](#environment-variables)
5. [Webhook Events](#webhook-events)
6. [Security Measures](#security-measures)
7. [Testing](#testing)
8. [Monitoring & Troubleshooting](#monitoring--troubleshooting)
9. [FAQ](#faq)

---

## Overview

The Guestly webhook integration enables real-time, two-way synchronization of bookings between your website and Guestly property management system.

**What it does:**

- ✅ Imports bookings made in Guestly (Airbnb, Booking.com, etc.) to your website
- ✅ Updates existing bookings when modified in Guestly
- ✅ Syncs cancellations from Guestly
- ✅ Clears availability cache when calendar changes
- ✅ Prevents double-bookings across platforms
- ✅ Maintains complete audit trail of all webhook events

---

## How Two-Way Sync Works

### Website → Guestly (Outbound Sync)

When a booking is made on your website:

1. Guest completes booking form
2. Payment processed via Stripe
3. Booking saved to your database
4. **Automatic sync** to Guestly via API (`lib/guestly/sync.ts`)
5. Guestly creates reservation and blocks calendar

### Guestly → Website (Inbound Sync - Webhooks)

When a booking is made on Guestly (e.g., via Airbnb):

1. Guest books on external platform (Airbnb, Booking.com)
2. Guestly receives booking
3. **Guestly sends webhook** to your endpoint
4. Your webhook handler processes event
5. Booking imported to your database
6. Availability cache cleared

### Preventing Duplicate Bookings

The system prevents duplicates by:

- Checking `guestly_reservation_id` before creating bookings
- Tracking `booking_source` (website vs guestly)
- Only allowing Guestly to update bookings it created
- Using unique Guestly reservation IDs as primary keys

---

## Setup Instructions

### Step 1: Configure Environment Variables

Add these to your `.env` file:

```bash
# Enable webhook processing
GUESTLY_WEBHOOK_ENABLED=true

# Webhook secret for signature verification (get from Guestly)
GUESTLY_WEBHOOK_SECRET=your-webhook-secret-here

# Your Guestly API credentials (already configured)
GUESTLY_API_KEY=your-api-key
```

### Step 2: Deploy Your Application

Deploy your application so the webhook endpoint is publicly accessible:

```
https://your-domain.com/api/webhooks/guestly
```

### Step 3: Configure Webhooks in Guestly Dashboard

1. **Log in to Guestly Dashboard**
   - Go to https://app.guesty.com

2. **Navigate to Integrations**
   - Settings → Integrations → Webhooks

3. **Create New Webhook**
   - Click "Add Webhook"

4. **Configure Webhook Settings**

   **Webhook URL:**
   ```
   https://your-domain.com/api/webhooks/guestly
   ```

   **Events to Subscribe:**
   - ✅ `reservation.created` - New bookings
   - ✅ `reservation.updated` - Booking modifications
   - ✅ `reservation.canceled` - Cancellations
   - ✅ `listing.calendar.updated` - Availability changes

   **Authentication Method:**
   - Select "HMAC Signature" or "API Key" (depending on what Guestly provides)
   - Copy your webhook secret to `.env` file

5. **Save and Test**
   - Click "Test Webhook" to send a test event
   - Verify it appears in your webhook logs

### Step 4: Run Database Migrations

Apply the webhook logging migration:

```bash
# Using Supabase CLI
supabase db push

# Or apply manually via Supabase Dashboard
# Run: supabase/migrations/20251119000003_add_webhook_logging.sql
```

### Step 5: Verify Setup

Test the webhook endpoint:

```bash
# Check endpoint health
curl https://your-domain.com/api/webhooks/guestly

# Send test webhook (local development)
npm run test-webhook reservationCreated
```

---

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `GUESTLY_WEBHOOK_ENABLED` | Enable/disable webhook processing | `true` |
| `GUESTLY_WEBHOOK_SECRET` | Secret for signature verification | `whsec_abc123...` |
| `GUESTLY_API_KEY` | Your Guestly API key | `Bearer xyz...` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase admin key | `eyJ...` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `WEBHOOK_TEST_URL` | URL for test webhook sender | `http://localhost:3000/api/webhooks/guestly` |

---

## Webhook Events

### 1. reservation.created

**Triggered when:** New booking made in Guestly (from any channel)

**Payload:**
```json
{
  "event_type": "reservation.created",
  "event_id": "evt_abc123",
  "timestamp": "2025-11-19T10:00:00Z",
  "data": {
    "_id": "6580ab123456789012345678",
    "listingId": "68e0da429e441d00129131d7",
    "checkIn": "2025-12-01",
    "checkOut": "2025-12-05",
    "status": "confirmed",
    "guestName": "John Smith",
    "guestEmail": "john@example.com",
    "guestPhone": "+49 30 12345678",
    "numberOfGuests": 2,
    "money": {
      "fareAccommodation": 850.00,
      "currency": "EUR"
    },
    "notes": "Early check-in requested",
    "source": "airbnb"
  }
}
```

**Action:** Creates new booking in your database with `booking_source = 'guestly'`

---

### 2. reservation.updated

**Triggered when:** Booking modified in Guestly (dates, guests, price, etc.)

**Payload:** Same structure as `reservation.created`

**Action:**
- Updates existing booking if it has `booking_source = 'guestly'`
- Creates new booking if not found
- Skips update if booking originated from website

---

### 3. reservation.canceled

**Triggered when:** Booking cancelled in Guestly

**Payload:**
```json
{
  "event_type": "reservation.canceled",
  "event_id": "evt_xyz789",
  "timestamp": "2025-11-19T11:00:00Z",
  "data": {
    "_id": "6580ab123456789012345678",
    "status": "canceled",
    ...
  }
}
```

**Action:**
- Marks booking as `status = 'cancelled'`
- Sets `payment_status = 'refunded'`
- Only cancels bookings with `booking_source = 'guestly'`

---

### 4. listing.calendar.updated

**Triggered when:** Availability or calendar changes in Guestly

**Payload:**
```json
{
  "event_type": "listing.calendar.updated",
  "event_id": "evt_cal123",
  "timestamp": "2025-11-19T12:00:00Z",
  "data": {
    "listingId": "68e0da429e441d00129131d7",
    "updatedDates": ["2025-12-01", "2025-12-02", "2025-12-03"]
  }
}
```

**Action:** Clears availability cache for the property

---

## Security Measures

### 1. Webhook Signature Verification

All webhooks are verified using HMAC-SHA256 signatures:

```typescript
// Guestly sends signature in header
X-Guestly-Signature: sha256=abc123...

// Your endpoint verifies it matches
const expectedSignature = crypto
  .createHmac('sha256', WEBHOOK_SECRET)
  .update(payload)
  .digest('hex');
```

**If signature is invalid:** Returns 401 Unauthorized

### 2. Request Validation

- ✅ Validates JSON payload structure
- ✅ Checks for required fields (`event_type`, `data`)
- ✅ Returns 400 Bad Request for invalid payloads

### 3. Idempotency

- ✅ Checks for duplicate bookings before creating
- ✅ Uses `guestly_reservation_id` as unique key
- ✅ Prevents double-imports if webhook retries

### 4. Source Tracking

- ✅ Tracks `booking_source` for every booking
- ✅ Only allows Guestly to modify its own bookings
- ✅ Website bookings protected from Guestly updates

### 5. Audit Logging

All webhook events logged to `webhook_logs` table:

- Event ID, type, payload
- Processing status (received, success, failed)
- Error messages
- Timestamps

### 6. Rate Limiting

Consider adding rate limiting for production:

```typescript
// Example: Max 100 requests per minute per IP
// Implement using Upstash Redis or similar
```

---

## Testing

### Local Development Testing

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Send test webhook:**
   ```bash
   # Test single event
   npm run test-webhook reservationCreated
   npm run test-webhook reservationUpdated
   npm run test-webhook reservationCanceled
   npm run test-webhook calendarUpdated

   # Test all events
   npm run test-webhook all
   ```

3. **Check logs:**
   ```bash
   # Application logs
   tail -f .next/server.log

   # Database logs
   # Query webhook_logs table in Supabase
   ```

### Test Payloads

Test payloads available in `lib/guestly/webhook-test-payloads.ts`:

- ✅ `reservationCreatedPayload` - Standard booking
- ✅ `reservationUpdatedPayload` - Modified booking
- ✅ `reservationCanceledPayload` - Cancelled booking
- ✅ `calendarUpdatedPayload` - Calendar change
- ✅ `minimalReservationPayload` - Edge case (minimal data)
- ✅ `singleNameGuestPayload` - Edge case (single name)
- ✅ `unknownListingPayload` - Error case (unknown property)

### Testing in Staging

1. **Deploy to staging environment**
2. **Update webhook URL in Guestly to staging URL**
3. **Use Guestly's "Test Webhook" button**
4. **Verify bookings appear in staging database**

### Testing in Production

1. **Start with test mode** (`GUESTLY_WEBHOOK_ENABLED=false`)
2. **Enable for single property first**
3. **Monitor logs for 24 hours**
4. **Gradually enable for all properties**

---

## Monitoring & Troubleshooting

### Check Webhook Logs

Query the `webhook_logs` table:

```sql
-- Recent webhook events
SELECT
  event_type,
  status,
  error,
  created_at
FROM webhook_logs
ORDER BY created_at DESC
LIMIT 50;

-- Failed webhooks
SELECT
  event_id,
  event_type,
  payload,
  error
FROM webhook_logs
WHERE status = 'failed'
ORDER BY created_at DESC;

-- Success rate
SELECT
  status,
  COUNT(*) as count
FROM webhook_logs
GROUP BY status;
```

### Common Issues

#### 1. Webhook Returns 401 Unauthorized

**Cause:** Signature verification failed

**Solution:**
- Verify `GUESTLY_WEBHOOK_SECRET` is correct
- Check signature header name (`x-guestly-signature`)
- Ensure secret matches Guestly dashboard

#### 2. Bookings Not Appearing

**Cause:** Property mapping issue

**Solution:**
- Verify `PROPERTY_MAP` in `integrations/guestly/client.ts`
- Check Guestly listing IDs are correct
- Ensure properties exist in database

#### 3. Duplicate Bookings

**Cause:** Webhook retry without duplicate check

**Solution:**
- Check `isDuplicateBooking()` function
- Verify `guestly_reservation_id` is being set
- Review `booking_source` field

#### 4. Webhooks Timing Out

**Cause:** Processing too slow

**Solution:**
- Check database query performance
- Verify async processing is working
- Consider increasing timeout limits

### Health Check

Check webhook endpoint health:

```bash
curl https://your-domain.com/api/webhooks/guestly

# Response:
{
  "status": "ok",
  "service": "guestly-webhook",
  "enabled": true,
  "timestamp": "2025-11-19T10:00:00Z"
}
```

### Admin Alerts

Critical failures trigger admin alerts (console logs):

```
CRITICAL WEBHOOK FAILURE: {
  eventType: "reservation.created",
  error: "Database connection failed",
  timestamp: "2025-11-19T10:00:00Z"
}
```

Configure email/Slack alerts in `sendWebhookFailureAlert()` function.

---

## FAQ

### Q: What happens if my webhook endpoint is down?

**A:** Guestly will retry failed webhooks automatically (typically up to 3 times with exponential backoff). All events are logged, so you can manually process missed webhooks from the logs.

### Q: Can I manually trigger a sync?

**A:** Yes, you can:
1. Use the test webhook utility: `npm run test-webhook reservationCreated`
2. Query Guestly API directly: `GET /reservations` and process manually
3. Use admin dashboard to create bookings manually

### Q: How do I handle timezone differences?

**A:** All dates are stored in ISO format (UTC). Guestly sends dates in UTC. Display dates in local timezone in your frontend.

### Q: What if a booking is made simultaneously on both platforms?

**A:** The first to complete wins. The second will fail availability check and prevent double-booking. The `check_in_date` and `check_out_date` constraints prevent overlapping bookings.

### Q: How do I disable webhooks temporarily?

**A:** Set `GUESTLY_WEBHOOK_ENABLED=false` in your environment variables.

### Q: Can I process webhooks selectively (e.g., only one property)?

**A:** Yes, modify `processWebhookEvent()` to filter by `listingId`:

```typescript
// In webhook-sync.ts
if (reservation.listingId !== 'your-target-listing-id') {
  return { success: true, action: 'skipped' };
}
```

### Q: How do I migrate existing Guestly bookings?

**A:** Use the Guestly API to fetch all reservations and process them:

```bash
# Create migration script
npm run migrate-guestly-bookings

# Or manually query
GET /api/guestly/reservations?startDate=2025-01-01
```

---

## Next Steps

1. ✅ Complete environment variable setup
2. ✅ Configure webhooks in Guestly dashboard
3. ✅ Test with sample payloads
4. ✅ Monitor logs for 24 hours
5. ✅ Enable for production
6. ✅ Set up monitoring alerts
7. ✅ Document your specific webhook secret location

---

## Support

For issues or questions:

- Check webhook logs: `webhook_logs` table
- Review application logs
- Test with sample payloads
- Verify environment variables
- Contact Guestly support for webhook configuration help

---

**Last Updated:** 2025-11-19
**Version:** 1.0.0
