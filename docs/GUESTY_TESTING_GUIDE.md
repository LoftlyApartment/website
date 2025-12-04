# Guesty Integration Testing Guide

## How to Verify Your Guesty.com Integration is Working

This guide will help you test that your website is properly integrated with Guesty.com.

---

## ✅ Step 1: Verify API Connection

### Test 1: Run the Connection Test Script

```bash
cd /Users/philippbernert/Desktop/LoftyV4/Website
npx tsx integrations/guestly/test-connection.ts
```

**Expected Output:**
```
✓ API Key configured
✓ Successfully fetched X properties
✓ Found property: Kantstraße (ID: 68e0da429e441d00129131d7)
✓ Found property: Hindenburgufer (ID: 68e0da486cf6cf001162ee98)
✓ Successfully fetched property details
✓ Successfully fetched availability data
```

**If you see errors:**
- Check that `GUESTY_API_KEY` is set in `.env.local`
- Verify the API key is still valid in Guesty dashboard
- Confirm property IDs are correct

---

## ✅ Step 2: Test Real-Time Availability Checking

### Test 2A: Check Website Calendar

1. **Start your dev server:**
   ```bash
   npm run dev
   ```

2. **Visit a property page:**
   - Go to: `http://localhost:3000/en/properties/kantstrasse`

3. **Select dates in the booking widget:**
   - Pick a date range (e.g., next week)
   - Watch for "Checking availability..." message

4. **Check browser console (F12):**
   ```
   [BookingWidget] Fetching real-time pricing for: { propertyId: 'kant', ... }
   [Pricing API] Calculating pricing for kant from 2025-XX-XX to 2025-XX-XX
   [Pricing API] Guesty pricing: X nights @ X avg/night = X total
   ```

**What to Look For:**
- ✅ Loading spinner appears
- ✅ Console shows API calls
- ✅ Dates marked as unavailable if already booked in Guesty
- ✅ Price updates dynamically

### Test 2B: Verify Blocked Dates

1. **In Guesty dashboard:**
   - Go to a property (Kantstraße or Hindenburgufer)
   - Block some dates manually or check existing reservations

2. **On your website:**
   - Try to select those blocked dates
   - They should show as unavailable

3. **Check API endpoint directly:**
   ```bash
   curl -X POST http://localhost:3000/api/availability/check \
     -H "Content-Type: application/json" \
     -d '{
       "propertyKey": "kant",
       "checkIn": "2025-12-01",
       "checkOut": "2025-12-05"
     }'
   ```

**Expected Response:**
```json
{
  "available": true,
  "unavailableDates": []
}
```
OR if dates are blocked:
```json
{
  "available": false,
  "unavailableDates": ["2025-12-02", "2025-12-03"]
}
```

---

## ✅ Step 3: Test Dynamic Pricing

### Test 3: Verify Guesty Prices are Loading

1. **Check pricing API:**
   ```bash
   curl -X POST http://localhost:3000/api/pricing/calculate \
     -H "Content-Type: application/json" \
     -d '{
       "propertyKey": "kant",
       "checkIn": "2025-12-01",
       "checkOut": "2025-12-05",
       "guests": 2,
       "hasPet": false
     }'
   ```

2. **Look for `"source": "guesty"` in response:**
   ```json
   {
     "basePrice": 120,
     "nights": 4,
     "total": 650,
     "currency": "EUR",
     "source": "guesty"  ← Should say "guesty" not "fallback"
   }
   ```

3. **Compare with Guesty dashboard:**
   - Check nightly rates in Guesty calendar
   - Verify website shows same prices

---

## ✅ Step 4: Test Booking Sync (Website → Guesty)

### IMPORTANT: Enable Sync First

Add to `.env.local`:
```env
GUESTY_SYNC_ENABLED=true
GUESTY_TEST_MODE=false  # Set to true for testing without real sync
```

### Test 4A: Test Mode (Recommended First)

1. **Set test mode:**
   ```env
   GUESTY_TEST_MODE=true
   ```

2. **Create a test booking on your website:**
   - Go through full booking flow
   - Complete payment (use Stripe test card: 4242 4242 4242 4242)

3. **Check console logs:**
   ```
   [Guestly Sync] Syncing booking BOOKING_ID to Guestly
   [TEST MODE] Would create Guestly reservation with data: {...}
   [Guestly Sync] Successfully synced booking (TEST MODE)
   ```

4. **Check database:**
   ```sql
   SELECT booking_reference, guestly_sync_status, guestly_reservation_id
   FROM bookings
   ORDER BY created_at DESC
   LIMIT 1;
   ```
   - Should show: `guestly_sync_status = 'synced'`
   - Should have: `guestly_reservation_id = 'test-reservation-id'`

### Test 4B: Production Mode (Real Sync)

**⚠️ WARNING: This creates real reservations in Guesty**

1. **Set production mode:**
   ```env
   GUESTY_TEST_MODE=false
   ```

2. **Create a test booking:**
   - Use future dates
   - Complete payment

3. **Check Guesty dashboard:**
   - Go to Reservations
   - Look for new reservation with guest name from website
   - Verify dates, guest info, and price match

4. **Check sync status in database:**
   ```sql
   SELECT
     booking_reference,
     guestly_sync_status,
     guestly_reservation_id,
     guestly_sync_error
   FROM bookings
   WHERE booking_reference = 'YOUR_BOOKING_REF';
   ```

5. **Check admin dashboard:**
   - Go to: `http://localhost:3000/en/admin/guestly-sync`
   - Look for your booking in sync logs
   - Should show status: "Synced" (green)

---

## ✅ Step 5: Test Webhook Integration (Guesty → Website)

### Test 5A: Test Webhook Endpoint

1. **Check webhook health:**
   ```bash
   curl http://localhost:3000/api/webhooks/guestly
   ```

   **Expected:**
   ```json
   {
     "status": "ok",
     "service": "guestly-webhook",
     "enabled": true
   }
   ```

2. **Send test webhook:**
   ```bash
   npm run test-webhook reservationCreated
   ```

   **Check output for:**
   - ✅ Webhook received
   - ✅ Signature verified
   - ✅ Event processed
   - ✅ Booking created in database

### Test 5B: Configure in Guesty Dashboard

1. **Go to Guesty.com:**
   - Settings → Integrations → Webhooks

2. **Add webhook URL:**
   ```
   https://your-domain.com/api/webhooks/guestly
   ```

3. **Subscribe to events:**
   - ✅ reservation.created
   - ✅ reservation.updated
   - ✅ reservation.canceled
   - ✅ listing.calendar.updated

4. **Set webhook secret:**
   - Copy the secret
   - Add to `.env`:
     ```
     GUESTLY_WEBHOOK_SECRET=your-webhook-secret
     GUESTLY_WEBHOOK_ENABLED=true
     ```

5. **Test in Guesty:**
   - Create a test reservation in Guesty
   - Check your website's `webhook_logs` table
   - Check if booking appears in your database

---

## ✅ Step 6: Check Admin Dashboard

### Test 6: Admin Monitoring

1. **Go to admin:**
   ```
   http://localhost:3000/en/admin
   ```

2. **Check Guestly Sync Status widget:**
   - Should show total synced bookings
   - Should show success rate
   - Should list any failed syncs

3. **Go to detailed sync page:**
   ```
   http://localhost:3000/en/admin/guestly-sync
   ```

4. **Verify you can see:**
   - ✅ Sync statistics
   - ✅ Recent sync logs
   - ✅ Webhook logs
   - ✅ Retry buttons work

---

## ✅ Step 7: Check Cache Performance

### Test 7: Verify Caching is Working

1. **Make availability request twice:**
   ```bash
   # First request (cache MISS)
   time curl -X POST http://localhost:3000/api/availability/check \
     -H "Content-Type: application/json" \
     -d '{"propertyKey": "kant", "checkIn": "2025-12-01", "checkOut": "2025-12-05"}'

   # Second request (cache HIT) - should be much faster
   time curl -X POST http://localhost:3000/api/availability/check \
     -H "Content-Type: application/json" \
     -d '{"propertyKey": "kant", "checkIn": "2025-12-01", "checkOut": "2025-12-05"}'
   ```

2. **Check console logs:**
   ```
   First request:  [Cache MISS] Fetching from Guesty API
   Second request: [Cache HIT] Returning cached data (age: 5s)
   ```

3. **Compare response times:**
   - First request: 200-500ms
   - Second request: <10ms (95%+ faster)

---

## 🔍 Troubleshooting

### Problem: "401 Unauthorized" errors

**Solutions:**
1. Verify API key in `.env.local` matches Guesty dashboard
2. Check API key hasn't expired
3. Regenerate API key in Guesty if needed

### Problem: "Property not found" errors

**Solutions:**
1. Verify property IDs in `integrations/guestly/client.ts`:
   ```typescript
   'kantstrasse': '68e0da429e441d00129131d7',
   'hindenburgufer': '68e0da486cf6cf001162ee98'
   ```
2. Check properties exist in your Guesty account
3. Verify property IDs match (check URL in Guesty dashboard)

### Problem: Sync status shows "failed"

**Solutions:**
1. Check error message in database:
   ```sql
   SELECT booking_reference, guestly_sync_error
   FROM bookings
   WHERE guestly_sync_status = 'failed';
   ```
2. Retry sync from admin dashboard
3. Check Guestly API is accessible
4. Verify all required booking fields are present

### Problem: Webhook not receiving events

**Solutions:**
1. Verify webhook URL is correct in Guesty
2. Check webhook secret matches
3. Ensure `GUESTLY_WEBHOOK_ENABLED=true`
4. Check webhook logs table for errors
5. Test webhook endpoint is accessible publicly (not just localhost)

### Problem: Prices showing as "fallback" instead of "guesty"

**Solutions:**
1. Check Guesty API connection
2. Verify availability API returns price data
3. Check console logs for errors
4. Clear pricing cache and try again

---

## 📊 Success Indicators

Your Guesty integration is working correctly if:

- ✅ API connection test passes
- ✅ Blocked dates show as unavailable on website
- ✅ Dynamic pricing loads from Guesty (source: "guesty")
- ✅ Website bookings sync to Guesty after payment
- ✅ Sync status shows "synced" in database
- ✅ Webhooks receive and process Guesty events
- ✅ Admin dashboard shows sync statistics
- ✅ Cache improves response times (95%+ faster on cache hits)
- ✅ No 401/403 errors in logs

---

## 📞 Need Help?

**Check logs:**
- Browser console (F12)
- Server terminal output
- Database `webhook_logs` table
- Admin dashboard sync logs

**Review documentation:**
- `/docs/GUESTY_SYNC.md` - Complete technical docs
- `/docs/GUESTY_WEBHOOK_SETUP.md` - Webhook configuration
- `/docs/GUESTY_SYNC_QUICKSTART.md` - Quick setup guide

---

**Last Updated:** 2025-11-20
**Integration Version:** 1.0.0
**Guesty API:** Open API v1
