# Database Quick Start Guide

## Setup Instructions

### 1. Apply Migrations

```bash
# Using Supabase CLI (recommended)
supabase db push

# Or apply manually via SQL Editor in Supabase Dashboard
```

### 2. Verify Tables

Check that all tables were created:
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

Expected tables:
- admin_profiles
- booking_notes
- bookings
- profiles (existing)
- properties
- subscriptions (existing)

### 3. Test Functions

```sql
-- Test booking reference generation
SELECT generate_booking_reference();
-- Expected: LA2025-12345

-- Test availability check
SELECT check_booking_availability(
  (SELECT id FROM properties LIMIT 1),
  '2025-12-01',
  '2025-12-05'
);
-- Expected: true (if no conflicts)

-- Test price calculation
SELECT * FROM calculate_booking_price(
  (SELECT id FROM properties LIMIT 1),
  '2025-12-01',
  '2025-12-08',
  false
);
-- Expected: pricing breakdown with nights, base_price, discount, etc.
```

### 4. Create First Admin User

After creating your auth user through Supabase Auth:

```sql
-- Get your user ID from auth.users
SELECT id, email FROM auth.users;

-- Create admin profile
INSERT INTO admin_profiles (id, full_name, role, is_active)
VALUES (
  'your-user-id-here',
  'Your Name',
  'admin',
  true
);
```

## Common Operations

### Query Properties

```typescript
import { createClient } from '@/lib/supabase/client';
import { getActiveProperties } from '@/lib/supabase/database-helpers';

const supabase = createClient();
const properties = await getActiveProperties(supabase);
```

### Check Availability

```typescript
import { checkAvailability } from '@/lib/supabase/database-helpers';

const isAvailable = await checkAvailability(
  supabase,
  propertyId,
  '2025-12-01',
  '2025-12-05'
);

if (!isAvailable) {
  console.log('Property is not available for these dates');
}
```

### Calculate Price

```typescript
import { calculatePrice } from '@/lib/supabase/database-helpers';

const pricing = await calculatePrice(
  supabase,
  propertyId,
  '2025-12-01',
  '2025-12-08',
  false // has pet
);

console.log(`Total: €${pricing.total}`);
```

### Create a Booking

```typescript
import { createBooking, generateBookingReference } from '@/lib/supabase/database-helpers';

const bookingRef = await generateBookingReference(supabase);

const booking = await createBooking(supabase, {
  booking_reference: bookingRef,
  property_id: propertyId,
  guest_first_name: 'John',
  guest_last_name: 'Doe',
  guest_email: 'john@example.com',
  guest_phone: '+49123456789',
  guest_country: 'Germany',
  check_in_date: '2025-12-01',
  check_out_date: '2025-12-05',
  adults: 2,
  children: 0,
  infants: 0,
  nights: 4,
  base_price: 480.00,
  discount: 0,
  cleaning_fee: 50.00,
  pet_fee: 0,
  subtotal: 530.00,
  vat: 100.70,
  total: 630.70,
  terms_accepted: true,
  privacy_accepted: true,
  marketing_consent: false,
});
```

### Update Booking Status

```typescript
import { updateBookingStatus } from '@/lib/supabase/database-helpers';

// Confirm a booking
await updateBookingStatus(supabase, bookingId, 'confirmed');

// Cancel a booking
await updateBookingStatus(supabase, bookingId, 'cancelled');
```

### Update Payment Status

```typescript
import { updateBookingPayment } from '@/lib/supabase/database-helpers';

await updateBookingPayment(supabase, bookingId, 'completed', {
  payment_method: 'card',
  stripe_payment_intent_id: 'pi_xxx',
  stripe_charge_id: 'ch_xxx',
});
```

## Admin Operations

### Get Booking with Notes

```typescript
import { getBookingByReference, getBookingNotes } from '@/lib/supabase/database-helpers';

const booking = await getBookingByReference(supabase, 'LA2025-12345');
const notes = await getBookingNotes(supabase, booking.id);
```

### Add Admin Note

```typescript
import { addBookingNote } from '@/lib/supabase/database-helpers';
import { createClient } from '@/lib/supabase/server';

const supabase = await createClient();
const { data: { user } } = await supabase.auth.getUser();

await addBookingNote(
  supabase,
  bookingId,
  'Guest requested early check-in',
  user?.id
);
```

### Get Dashboard Statistics

```typescript
import { getBookingStats, getUpcomingBookings } from '@/lib/supabase/database-helpers';

// Get stats for current month
const startOfMonth = new Date().toISOString().split('T')[0];
const stats = await getBookingStats(supabase, startOfMonth);

console.log(`Total bookings: ${stats.total}`);
console.log(`Revenue: €${stats.revenue}`);

// Get next 10 upcoming bookings
const upcoming = await getUpcomingBookings(supabase, 10);
```

## Testing with Sample Data

### Insert Test Booking

```sql
-- Generate booking reference
SELECT generate_booking_reference() AS ref;

-- Insert test booking (use the generated ref)
INSERT INTO bookings (
  booking_reference,
  property_id,
  guest_first_name,
  guest_last_name,
  guest_email,
  guest_phone,
  guest_country,
  check_in_date,
  check_out_date,
  adults,
  nights,
  base_price,
  cleaning_fee,
  subtotal,
  vat,
  total,
  terms_accepted,
  privacy_accepted
) VALUES (
  'LA2025-12345', -- Use generated ref
  (SELECT id FROM properties WHERE slug = 'kantstrasse'),
  'Test',
  'User',
  'test@example.com',
  '+49123456789',
  'Germany',
  '2025-12-01',
  '2025-12-05',
  2,
  4,
  480.00,
  50.00,
  530.00,
  100.70,
  630.70,
  true,
  true
);
```

### Query Test Data

```sql
-- Get all bookings with property details
SELECT
  b.booking_reference,
  b.status,
  b.payment_status,
  p.name AS property_name,
  b.check_in_date,
  b.check_out_date,
  b.total
FROM bookings b
JOIN properties p ON b.property_id = p.id
ORDER BY b.created_at DESC;

-- Get unavailable dates for a property
SELECT * FROM get_unavailable_dates(
  (SELECT id FROM properties WHERE slug = 'kantstrasse'),
  '2025-12-01',
  '2025-12-31'
);
```

## Troubleshooting

### RLS Errors

If you get permission errors:

```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- Test with admin client (server-side)
-- Use createAdminClient() from @/lib/supabase/server
```

### Function Errors

```sql
-- List all functions
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public';

-- Test function directly
SELECT * FROM calculate_booking_price(
  'property-uuid',
  '2025-12-01',
  '2025-12-08',
  false
);
```

### Index Performance

```sql
-- Check if indexes exist
SELECT tablename, indexname
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename;

-- Analyze query performance
EXPLAIN ANALYZE
SELECT * FROM bookings
WHERE property_id = 'some-uuid'
AND check_in_date >= '2025-12-01';
```

## Next Steps

1. Upload property images to Supabase Storage
2. Update properties with image URLs
3. Set up Stripe webhook endpoints
4. Create admin dashboard pages
5. Build booking flow in frontend
6. Test end-to-end booking process
7. Set up email notifications

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Storage](https://supabase.com/docs/guides/storage)
- [Database Functions](https://supabase.com/docs/guides/database/functions)
