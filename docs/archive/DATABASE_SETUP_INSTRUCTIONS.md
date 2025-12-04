# Production Database Setup Instructions

## Overview

This guide will help you set up your Supabase production database using the consolidated setup script.

## File Created

**Location**: `/Users/philippbernert/Desktop/LoftyV4/Website/PRODUCTION_DATABASE_SETUP.sql`

## Issues Fixed

The consolidated script resolves several issues found in the original migration files:

1. **Duplicate UUID Extension**: Consolidated single extension creation
2. **Function Naming Conflicts**: Unified `handle_updated_at()` function for all tables
3. **Dependency Order**: All objects created in proper order:
   - Extensions → Enums → Tables → Indexes → Functions → Triggers → RLS Policies → Grants → Seed Data
4. **Foreign Key References**: Tables are created before any references to them
5. **Function Dependencies**: Functions created before triggers that use them
6. **Consistent Naming**: Used `public.` schema prefix throughout for clarity

## How to Run the Script

### Option 1: Supabase Dashboard (Recommended for First Time)

1. Log in to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire contents of `PRODUCTION_DATABASE_SETUP.sql`
5. Paste into the SQL editor
6. Click **Run** (or press Cmd/Ctrl + Enter)
7. Wait for completion (should take 5-10 seconds)
8. Check for any errors in the output panel

### Option 2: Supabase CLI

```bash
# Make sure you're logged in
npx supabase login

# Link to your production project
npx supabase link --project-ref YOUR_PROJECT_REF

# Run the setup script
npx supabase db push --db-url "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres" < PRODUCTION_DATABASE_SETUP.sql
```

### Option 3: Direct PostgreSQL Connection

```bash
psql "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres" -f PRODUCTION_DATABASE_SETUP.sql
```

## Verification Steps

After running the script, verify the setup:

### 1. Check Tables

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

Expected tables:
- `admin_profiles`
- `booking_notes`
- `bookings`
- `profiles`
- `properties`
- `subscriptions`

### 2. Check Functions

```sql
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;
```

Expected functions:
- `calculate_booking_price`
- `check_booking_availability`
- `generate_booking_reference`
- `get_unavailable_dates`
- `handle_new_user`
- `handle_updated_at`
- `sync_membership_tier`

### 3. Check Triggers

```sql
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY trigger_name;
```

Expected triggers:
- `on_auth_user_created` on `auth.users`
- `on_profile_updated` on `profiles`
- `on_subscription_status_changed` on `subscriptions`
- `on_subscription_updated` on `subscriptions`
- `update_admin_profiles_updated_at` on `admin_profiles`
- `update_bookings_updated_at` on `bookings`
- `update_properties_updated_at` on `properties`

### 4. Check Seed Data

```sql
SELECT slug, name FROM public.properties;
```

Expected properties:
- `kantstrasse` - Kantstrasse Apartment
- `hindenburgdamm` - Hindenburgdamm Apartment

### 5. Test Booking Price Calculation

```sql
SELECT * FROM public.calculate_booking_price(
  (SELECT id FROM public.properties WHERE slug = 'kantstrasse'),
  CURRENT_DATE + INTERVAL '1 day',
  CURRENT_DATE + INTERVAL '8 days',
  false
);
```

Should return pricing breakdown with 7 nights and weekly discount applied.

## Post-Setup Tasks

After successful database setup:

### 1. Create Your First Admin User

```sql
-- First, create a user through Supabase Auth (email/password signup)
-- Then add them to admin_profiles:

INSERT INTO public.admin_profiles (id, full_name, role, is_active)
VALUES (
  'YOUR_AUTH_USER_ID',  -- Get this from auth.users table
  'Your Full Name',
  'admin',
  true
);
```

### 2. Upload Property Images

1. Go to Supabase Storage
2. Create a bucket named `property-images` (make it public)
3. Upload images for each property
4. Update the properties table with image URLs:

```sql
UPDATE public.properties
SET images = '[
  "https://your-project.supabase.co/storage/v1/object/public/property-images/kantstrasse-1.jpg",
  "https://your-project.supabase.co/storage/v1/object/public/property-images/kantstrasse-2.jpg"
]'::jsonb
WHERE slug = 'kantstrasse';
```

### 3. Configure Stripe Webhook

1. Set up your Stripe webhook endpoint: `https://your-domain.com/api/webhooks/stripe`
2. Add webhook signing secret to environment variables
3. Test webhook with Stripe CLI:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### 4. Update Environment Variables

Ensure your `.env.local` has:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
```

## Troubleshooting

### Error: "relation already exists"

If you get errors about existing tables, you may need to drop existing objects first:

```sql
-- WARNING: This will delete ALL data
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```

Then re-run the setup script.

### Error: "permission denied"

Make sure you're using a superuser account or the `postgres` user from Supabase.

### Error: "column does not exist"

This shouldn't happen with the consolidated script, but if it does, check the order of operations. The script is designed to create objects in dependency order.

## What This Script Does

The script sets up a complete production-ready database with:

- ✅ User authentication and profiles (Supabase Auth integration)
- ✅ Stripe subscription management
- ✅ Property management system
- ✅ Booking system with availability checking
- ✅ Admin user system with role-based access
- ✅ Row Level Security (RLS) for data protection
- ✅ Automatic timestamp updates
- ✅ Booking price calculation with discounts
- ✅ GDPR compliance fields
- ✅ Performance indexes
- ✅ Sample property data

## Database Schema Overview

```
auth.users (Supabase managed)
    ↓
profiles (public user data)
    ↓
subscriptions (Stripe billing)

properties (apartment listings)
    ↓
bookings (reservation records)
    ↓
booking_notes (admin notes)

admin_profiles (admin users)
```

## Need Help?

If you encounter any issues:

1. Check the Supabase logs in the dashboard
2. Review the error message carefully
3. Make sure you're running on a fresh database or have properly cleaned up
4. Verify your Supabase project is active and accessible

## Success Indicators

Your database is ready when:

- ✅ All tables created without errors
- ✅ All functions and triggers in place
- ✅ RLS policies enabled and working
- ✅ Seed data visible in properties table
- ✅ Test queries return expected results
- ✅ Your application can connect and query successfully
