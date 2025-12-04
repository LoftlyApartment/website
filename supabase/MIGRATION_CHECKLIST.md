# Database Migration Checklist

## Pre-Migration Verification

- [ ] Supabase project created
- [ ] Environment variables configured in `.env.local`:
  ```
  NEXT_PUBLIC_SUPABASE_URL=your_project_url
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
  SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
  ```
- [ ] Supabase CLI installed: `npm install -g supabase`
- [ ] Logged in to Supabase CLI: `supabase login`
- [ ] Project linked: `supabase link --project-ref YOUR_PROJECT_REF`

## Migration Steps

### Step 1: Apply Core Tables
```bash
supabase db push --file supabase/migrations/20251030000001_create_core_tables.sql
```

**Verify:**
```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('properties', 'bookings', 'admin_profiles', 'booking_notes');
```
Expected: 4 rows

- [ ] Tables created successfully
- [ ] Indexes created (check with `\di` in psql)

### Step 2: Apply Functions and Triggers
```bash
supabase db push --file supabase/migrations/20251030000002_create_functions_and_triggers.sql
```

**Verify:**
```sql
-- Test booking reference generation
SELECT generate_booking_reference();

-- Test price calculation (use property ID from step 4)
SELECT * FROM calculate_booking_price(
  (SELECT id FROM properties LIMIT 1),
  '2025-12-01',
  '2025-12-08',
  false
);
```

- [ ] `generate_booking_reference()` returns LA2025-XXXXX format
- [ ] `calculate_booking_price()` returns pricing breakdown
- [ ] `check_booking_availability()` function exists
- [ ] `get_unavailable_dates()` function exists
- [ ] Triggers created on all tables

### Step 3: Apply RLS Policies
```bash
supabase db push --file supabase/migrations/20251030000003_create_rls_policies.sql
```

**Verify:**
```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('properties', 'bookings', 'admin_profiles', 'booking_notes');

-- List all policies
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

- [ ] RLS enabled on all 4 tables
- [ ] 13 policies created total
- [ ] Properties readable by everyone (test in browser)
- [ ] Bookings restricted (test with different users)

### Step 4: Apply Seed Data
```bash
supabase db push --file supabase/migrations/20251030000004_seed_data.sql
```

**Verify:**
```sql
-- Check properties inserted
SELECT slug, name, base_price, pet_friendly FROM properties;
```

Expected:
- kantstrasse (€120, not pet-friendly)
- hindenburgdamm (€95, pet-friendly)

- [ ] 2 properties inserted
- [ ] Kantstrasse details correct
- [ ] Hindenburgdamm details correct

## Post-Migration Configuration

### Create Admin User

1. **Create Auth User** (via Supabase Dashboard or signup flow)
   - Go to Authentication > Users
   - Create new user or sign up via your app
   - Copy the user UUID

2. **Add Admin Profile**
```sql
-- Replace 'YOUR-USER-UUID' with actual UUID from step 1
INSERT INTO admin_profiles (id, full_name, role, is_active)
VALUES (
  'YOUR-USER-UUID',
  'Admin Name',
  'admin',
  true
);
```

3. **Verify Admin Access**
```sql
SELECT * FROM admin_profiles;
```

- [ ] Admin user created in auth.users
- [ ] Admin profile created in admin_profiles
- [ ] Admin can access all bookings (test with admin login)

### Upload Property Images

1. **Create Storage Bucket**
   - Go to Storage in Supabase Dashboard
   - Create bucket: `property-images`
   - Set as public bucket

2. **Upload Images**
   - Upload images for Kantstrasse
   - Upload images for Hindenburgdamm
   - Note the public URLs

3. **Update Properties**
```sql
-- Update Kantstrasse images
UPDATE properties
SET images = '[
  "https://your-project.supabase.co/storage/v1/object/public/property-images/kantstrasse/1.jpg",
  "https://your-project.supabase.co/storage/v1/object/public/property-images/kantstrasse/2.jpg"
]'::jsonb
WHERE slug = 'kantstrasse';

-- Update Hindenburgdamm images
UPDATE properties
SET images = '[
  "https://your-project.supabase.co/storage/v1/object/public/property-images/hindenburgdamm/1.jpg",
  "https://your-project.supabase.co/storage/v1/object/public/property-images/hindenburgdamm/2.jpg"
]'::jsonb
WHERE slug = 'hindenburgdamm';
```

- [ ] Storage bucket created
- [ ] Images uploaded
- [ ] Property records updated with image URLs

## Testing

### Test 1: Query Properties
```typescript
import { createClient } from '@/lib/supabase/client';
import { getActiveProperties } from '@/lib/supabase/database-helpers';

const supabase = createClient();
const properties = await getActiveProperties(supabase);
console.log('Found properties:', properties.length);
// Expected: 2
```

- [ ] Can fetch properties from client
- [ ] Properties have all fields populated
- [ ] Images array populated

### Test 2: Check Availability
```typescript
import { checkAvailability } from '@/lib/supabase/database-helpers';

const available = await checkAvailability(
  supabase,
  propertyId,
  '2025-12-01',
  '2025-12-05'
);
console.log('Available:', available);
// Expected: true (no bookings yet)
```

- [ ] Availability check works
- [ ] Returns true for unbooked dates
- [ ] Returns false for booked dates (after creating test booking)

### Test 3: Calculate Price
```typescript
import { calculatePrice } from '@/lib/supabase/database-helpers';

const pricing = await calculatePrice(
  supabase,
  propertyId,
  '2025-12-01',
  '2025-12-08', // 7 nights
  false
);
console.log('Pricing:', pricing);
// Expected: includes 10% weekly discount
```

- [ ] Price calculation works
- [ ] Weekly discount applied (7+ nights)
- [ ] Monthly discount applied (28+ nights)
- [ ] VAT calculated correctly (19%)
- [ ] Pet fee added when has_pet=true

### Test 4: Create Booking
```typescript
import { generateBookingReference, createBooking } from '@/lib/supabase/database-helpers';

const bookingRef = await generateBookingReference(supabase);
console.log('Booking ref:', bookingRef);
// Expected: LA2025-12345

const booking = await createBooking(supabase, {
  booking_reference: bookingRef,
  property_id: propertyId,
  guest_first_name: 'Test',
  guest_last_name: 'User',
  guest_email: 'test@example.com',
  guest_phone: '+49123456789',
  guest_country: 'Germany',
  check_in_date: '2025-12-01',
  check_out_date: '2025-12-05',
  adults: 2,
  nights: 4,
  base_price: 480.00,
  cleaning_fee: 50.00,
  subtotal: 530.00,
  vat: 100.70,
  total: 630.70,
  terms_accepted: true,
  privacy_accepted: true,
});
console.log('Created booking:', booking.id);
```

- [ ] Booking reference generated
- [ ] Booking created successfully
- [ ] Can query booking by reference
- [ ] Guest can view their booking by email

### Test 5: Admin Operations
```typescript
import { addBookingNote, getBookingNotes } from '@/lib/supabase/database-helpers';
import { createClient } from '@/lib/supabase/server';

const supabase = await createClient();
const { data: { user } } = await supabase.auth.getUser();

await addBookingNote(
  supabase,
  bookingId,
  'Test note from admin',
  user?.id
);

const notes = await getBookingNotes(supabase, bookingId);
console.log('Booking notes:', notes.length);
// Expected: 1
```

- [ ] Admin can add notes
- [ ] Admin can view all notes
- [ ] Non-admin cannot access notes (test with non-admin user)

## Performance Verification

### Check Index Usage
```sql
-- Run a common query with EXPLAIN ANALYZE
EXPLAIN ANALYZE
SELECT * FROM bookings
WHERE property_id = 'some-uuid'
AND check_in_date >= '2025-12-01'
AND status != 'cancelled';

-- Should show "Index Scan" not "Seq Scan"
```

- [ ] Queries use indexes (Index Scan in explain plan)
- [ ] No sequential scans on large tables

### Check Function Performance
```sql
-- Test with multiple properties and date ranges
EXPLAIN ANALYZE
SELECT * FROM get_unavailable_dates(
  (SELECT id FROM properties LIMIT 1),
  '2025-01-01',
  '2025-12-31'
);
```

- [ ] Functions execute quickly (< 100ms)
- [ ] No obvious performance issues

## Security Verification

### Test RLS Policies

1. **Test as Anonymous User**
```typescript
const supabase = createClient();
// Should work: read properties
const properties = await supabase.from('properties').select('*');

// Should fail: create property
const { error } = await supabase.from('properties').insert({...});
console.log('Error:', error); // Expected: permission denied
```

- [ ] Anonymous can read active properties
- [ ] Anonymous cannot modify properties
- [ ] Anonymous can create bookings

2. **Test as Guest User**
```typescript
// Sign in as guest
const supabase = createClient();
await supabase.auth.signInWithPassword({
  email: 'guest@example.com',
  password: 'password'
});

// Should work: read own bookings
const { data } = await supabase.from('bookings')
  .select('*')
  .eq('guest_email', 'guest@example.com');

// Should fail: read other bookings
const { error } = await supabase.from('bookings')
  .select('*')
  .eq('guest_email', 'other@example.com');
```

- [ ] Guests can view their own bookings
- [ ] Guests cannot view other bookings
- [ ] Guests cannot modify bookings

3. **Test as Admin User**
```typescript
// Sign in as admin
const supabase = createClient();
await supabase.auth.signInWithPassword({
  email: 'admin@example.com',
  password: 'password'
});

// Should work: read all bookings
const { data } = await supabase.from('bookings').select('*');

// Should work: update booking
const { data: updated } = await supabase.from('bookings')
  .update({ status: 'confirmed' })
  .eq('id', bookingId);
```

- [ ] Admin can view all bookings
- [ ] Admin can modify bookings
- [ ] Admin can manage properties
- [ ] Admin can add/view notes

## Final Checklist

- [ ] All migrations applied successfully
- [ ] All functions working correctly
- [ ] All RLS policies enforced
- [ ] Seed data inserted
- [ ] Admin user created and tested
- [ ] Property images uploaded
- [ ] All helper functions tested
- [ ] Performance verified
- [ ] Security verified
- [ ] TypeScript compilation successful
- [ ] No console errors in browser
- [ ] Ready for frontend integration

## Rollback Plan

If something goes wrong:

```bash
# Reset local database
supabase db reset

# Or drop specific tables
DROP TABLE IF EXISTS booking_notes CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS admin_profiles CASCADE;
DROP TABLE IF EXISTS properties CASCADE;

# Drop functions
DROP FUNCTION IF EXISTS generate_booking_reference CASCADE;
DROP FUNCTION IF EXISTS check_booking_availability CASCADE;
DROP FUNCTION IF EXISTS calculate_booking_price CASCADE;
DROP FUNCTION IF EXISTS get_unavailable_dates CASCADE;
```

## Support

If you encounter issues:

1. Check Supabase Dashboard logs
2. Review migration SQL for syntax errors
3. Verify environment variables
4. Check RLS policies aren't blocking operations
5. Review `supabase/README.md` for detailed docs
6. Review `supabase/QUICKSTART.md` for examples

---

**Migration Status**: ⏳ Pending
**Last Updated**: 2025-10-30
**Estimated Time**: 30-45 minutes
