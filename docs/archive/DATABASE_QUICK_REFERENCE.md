# Database Setup - Quick Reference Card

## Files You Need

1. **PRODUCTION_DATABASE_SETUP.sql** - The main setup script (run this!)
2. **DATABASE_SETUP_INSTRUCTIONS.md** - Detailed instructions
3. **verify-database-setup.js** - Test script after setup

## 3-Step Setup

### Step 1: Run Setup Script (Choose ONE method)

**METHOD A: Supabase Dashboard** (Recommended)
```
1. Login to Supabase → Your Project
2. Click "SQL Editor" in sidebar
3. Click "New Query"
4. Copy/paste entire PRODUCTION_DATABASE_SETUP.sql
5. Click "Run" or press Cmd+Enter
6. Wait ~10 seconds
```

**METHOD B: Command Line**
```bash
# Using Supabase CLI
npx supabase db push --db-url "YOUR_DB_URL" < PRODUCTION_DATABASE_SETUP.sql

# OR using psql
psql "YOUR_DB_URL" -f PRODUCTION_DATABASE_SETUP.sql
```

### Step 2: Verify Setup

```bash
node verify-database-setup.js
```

Look for: `✓ All tests passed! Database is ready.`

### Step 3: Create Admin User

```sql
-- After first user signup, run:
INSERT INTO public.admin_profiles (id, full_name, role, is_active)
VALUES ('USER_ID_FROM_AUTH_USERS', 'Your Name', 'admin', true);
```

## What Gets Created

| Object Type | Count | Examples |
|-------------|-------|----------|
| Tables | 6 | profiles, properties, bookings |
| Functions | 7 | calculate_booking_price, check_availability |
| Triggers | 7 | auto-create profile, update timestamps |
| Indexes | 16 | slug lookups, email searches |
| RLS Policies | 24 | user privacy, admin access |
| Sample Data | 2 properties | Kantstrasse, Hindenburgdamm |

## Quick Verification Queries

**Check tables exist:**
```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' ORDER BY table_name;
```

**Check properties loaded:**
```sql
SELECT slug, name FROM public.properties;
```

**Test booking reference generation:**
```sql
SELECT public.generate_booking_reference();
```

**Test price calculation:**
```sql
SELECT * FROM public.calculate_booking_price(
  (SELECT id FROM public.properties WHERE slug = 'kantstrasse'),
  CURRENT_DATE + 1,
  CURRENT_DATE + 8,
  false
);
```

## Common Issues & Fixes

### Issue: "relation already exists"
**Fix:** Database not empty. Reset it:
```sql
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
-- Then re-run PRODUCTION_DATABASE_SETUP.sql
```

### Issue: "permission denied"
**Fix:** Use postgres user or service_role key

### Issue: Can't find database URL
**Fix:** Get from Supabase Dashboard → Settings → Database
```
Format: postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres
```

## Environment Variables Needed

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Testing the Database

**Test 1: Can read properties (public access)**
```bash
curl "https://[project].supabase.co/rest/v1/properties?select=slug,name" \
  -H "apikey: YOUR_ANON_KEY"
```

**Test 2: Generate booking reference**
```sql
SELECT public.generate_booking_reference();
-- Should return: LA2025-XXXXX
```

**Test 3: Check availability**
```sql
SELECT public.check_booking_availability(
  (SELECT id FROM properties LIMIT 1),
  '2025-12-01',
  '2025-12-05'
);
-- Should return: true (available)
```

## Database Schema at a Glance

```
auth.users (Supabase managed)
  ├─→ profiles (user public data)
  │     └─→ subscriptions (Stripe billing)
  │
  └─→ admin_profiles (admin access)

properties (apartments)
  └─→ bookings (reservations)
        └─→ booking_notes (admin notes)
```

## Next Actions After Setup

1. **Upload Images**
   - Create storage bucket: `property-images`
   - Upload apartment photos
   - Update properties.images field

2. **Test Booking**
   - Visit your site
   - Select property
   - Complete booking form
   - Verify in database

3. **Configure Stripe**
   - Set webhook URL: `https://yoursite.com/api/webhooks/stripe`
   - Add signing secret to .env
   - Test payment flow

4. **Create Admin**
   - Sign up via app
   - Add to admin_profiles
   - Access admin dashboard

## Key Database URLs

**Dashboard**: `https://app.supabase.com/project/[project]`
**SQL Editor**: `https://app.supabase.com/project/[project]/sql`
**Table Editor**: `https://app.supabase.com/project/[project]/editor`
**API Docs**: `https://app.supabase.com/project/[project]/api`

## Support Checklist

Before asking for help:
- [ ] Ran PRODUCTION_DATABASE_SETUP.sql completely
- [ ] Checked Supabase logs for errors
- [ ] Ran verify-database-setup.js
- [ ] Verified environment variables
- [ ] Checked database is not in paused state
- [ ] Confirmed service role key has permissions

## Success Criteria

Your database is ready when:
- ✅ `verify-database-setup.js` shows all tests passed
- ✅ Can see 2 properties in table editor
- ✅ Can generate booking references
- ✅ Can calculate prices
- ✅ Your Next.js app connects without errors
- ✅ Can create test booking through UI

## One-Line Setup Summary

```bash
# Copy PRODUCTION_DATABASE_SETUP.sql to Supabase SQL Editor → Run → Done!
```

That's it! Your database is production-ready.
