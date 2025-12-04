# Supabase Database Schema - Loftly Apartment Booking System

This directory contains the database schema for the Loftly apartment booking system, including migrations, Row Level Security (RLS) policies, and seed data.

## Database Overview

The booking system consists of 4 main tables:

1. **properties** - Apartment listings with pricing and amenities
2. **bookings** - Guest reservations with full booking lifecycle
3. **admin_profiles** - Admin user management extending auth.users
4. **booking_notes** - Internal notes for admin use

Additionally, the system includes:
- **profiles** - User profiles (existing)
- **subscriptions** - Stripe subscription management (existing)

## Migration Files

The migrations are numbered sequentially and should be applied in order:

1. `20251030000001_create_core_tables.sql` - Creates all core tables and indexes
2. `20251030000002_create_functions_and_triggers.sql` - Creates database functions and triggers
3. `20251030000003_create_rls_policies.sql` - Sets up Row Level Security policies
4. `20251030000004_seed_data.sql` - Inserts initial property data

## Applying Migrations

### Method 1: Using Supabase CLI (Recommended)

```bash
# Make sure you're logged in to Supabase CLI
supabase login

# Link your project (if not already linked)
supabase link --project-ref YOUR_PROJECT_REF

# Apply all migrations
supabase db push

# Or apply migrations one at a time
supabase db push --file supabase/migrations/20251030000001_create_core_tables.sql
supabase db push --file supabase/migrations/20251030000002_create_functions_and_triggers.sql
supabase db push --file supabase/migrations/20251030000003_create_rls_policies.sql
supabase db push --file supabase/migrations/20251030000004_seed_data.sql
```

### Method 2: Via Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of each migration file in order
4. Execute each migration

### Method 3: Local Development

```bash
# Start local Supabase instance
supabase start

# Migrations will be applied automatically
# Access local database at: http://localhost:54323
```

## Database Functions

### `generate_booking_reference()`
Generates unique booking references in format: `LA2025-12345`

**Usage:**
```sql
SELECT generate_booking_reference();
```

### `check_booking_availability(property_id, check_in, check_out, booking_id?)`
Checks if a property is available for the specified dates.

**Usage:**
```sql
SELECT check_booking_availability(
  'property-uuid-here',
  '2025-11-01',
  '2025-11-05'
);
-- Returns: true or false
```

### `calculate_booking_price(property_id, check_in, check_out, has_pet?)`
Calculates the complete pricing breakdown for a booking.

**Usage:**
```sql
SELECT * FROM calculate_booking_price(
  'property-uuid-here',
  '2025-11-01',
  '2025-11-08',
  false
);
-- Returns: nights, base_price, discount, cleaning_fee, pet_fee, subtotal, vat, total
```

### `get_unavailable_dates(property_id, start_date, end_date)`
Returns all unavailable dates for a property in a given date range.

**Usage:**
```sql
SELECT * FROM get_unavailable_dates(
  'property-uuid-here',
  '2025-11-01',
  '2025-11-30'
);
-- Returns: list of unavailable dates
```

## Row Level Security (RLS)

All tables have RLS enabled with the following policies:

### Properties
- **Public Read**: Everyone can view active properties
- **Admin Write**: Only active admins can create, update, or delete properties

### Bookings
- **Public Create**: Anyone can create a booking
- **Guest Read**: Users can view bookings matching their email
- **Admin Full Access**: Admins can view, update, and delete all bookings

### Admin Profiles
- **Admin Read**: Only active admins can view admin profiles
- **Admin Manage**: Only admin role can create/update admin profiles

### Booking Notes
- **Admin Only**: Only active admins can view and manage booking notes

## Seed Data

The seed data includes two properties:

1. **Kantstrasse Apartment**
   - 2 bedrooms, 1 bathroom
   - 90 sqm, up to 5 guests
   - Base price: €120/night
   - Not pet-friendly

2. **Hindenburgdamm Apartment**
   - 2 bedrooms, 1 bathroom
   - 75 sqm, up to 4 guests
   - Base price: €95/night
   - Pet-friendly (€20 pet fee)

## TypeScript Types

The database types are automatically generated and available at:
```typescript
import type { Database } from '@/types/database';
import type { Property, Booking, BookingInsert } from '@/types/database';
```

## Supabase Clients

Use the appropriate client for your context:

### Client Components
```typescript
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();
```

### Server Components & Actions
```typescript
import { createClient } from '@/lib/supabase/server';

const supabase = await createClient();
```

### Admin Operations (Server-side only)
```typescript
import { createAdminClient } from '@/lib/supabase/server';

const supabase = createAdminClient();
```

## Database Schema Diagram

```
┌─────────────────┐
│   properties    │
│─────────────────│
│ id (PK)         │
│ slug (UNIQUE)   │
│ name            │
│ address         │
│ pricing...      │
│ amenities[]     │
│ images[]        │
└────────┬────────┘
         │
         │ 1:N
         │
┌────────▼────────┐      ┌──────────────────┐
│    bookings     │──N:1─│ admin_profiles   │
│─────────────────│      │──────────────────│
│ id (PK)         │      │ id (PK, FK)      │
│ booking_ref     │      │ role             │
│ property_id(FK) │      │ is_active        │
│ guest_info...   │      └────────┬─────────┘
│ dates...        │               │
│ pricing...      │               │ 1:N
│ payment...      │               │
│ status          │      ┌────────▼────────┐
└────────┬────────┘      │ booking_notes   │
         │               │─────────────────│
         │ 1:N           │ id (PK)         │
         └───────────────│ booking_id (FK) │
                         │ admin_id (FK)   │
                         │ note            │
                         └─────────────────┘
```

## Environment Variables

Ensure these are set in your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Troubleshooting

### Migration Fails
- Check that you have the correct permissions
- Verify you're connected to the right project
- Make sure previous migrations completed successfully

### RLS Blocking Queries
- For testing, you can temporarily disable RLS:
  ```sql
  ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;
  ```
- Don't forget to re-enable it!

### Functions Not Working
- Ensure the functions migration was applied successfully
- Check function permissions if using from client code

## Next Steps

1. Apply all migrations to your Supabase project
2. Verify tables and functions in Supabase dashboard
3. Upload property images to Supabase Storage
4. Update property records with image URLs
5. Create your first admin user in admin_profiles table
6. Test the booking flow end-to-end

## Production Checklist

- [ ] All migrations applied successfully
- [ ] RLS policies tested and verified
- [ ] Database backups configured
- [ ] Connection pooling configured (for high traffic)
- [ ] Indexes verified with query performance
- [ ] Property images uploaded to storage
- [ ] At least one admin user created
- [ ] Test bookings created and verified
- [ ] Webhook endpoints configured (for Stripe)
- [ ] Monitoring and alerts set up

## Support

For issues or questions:
1. Check Supabase documentation: https://supabase.com/docs
2. Review migration files for schema details
3. Test queries in SQL Editor with sample data
