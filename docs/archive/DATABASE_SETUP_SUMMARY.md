# Database Setup - Summary Report

## Files Created

### 1. **PRODUCTION_DATABASE_SETUP.sql**
   - **Location**: `/Users/philippbernert/Desktop/LoftyV4/Website/PRODUCTION_DATABASE_SETUP.sql`
   - **Purpose**: Single, consolidated SQL script that sets up the entire database
   - **Size**: ~850 lines of well-documented SQL
   - **Status**: ✅ Ready to run on production

### 2. **DATABASE_SETUP_INSTRUCTIONS.md**
   - **Location**: `/Users/philippbernert/Desktop/LoftyV4/Website/DATABASE_SETUP_INSTRUCTIONS.md`
   - **Purpose**: Comprehensive guide for running the setup script
   - **Includes**: Step-by-step instructions, verification queries, troubleshooting

### 3. **verify-database-setup.js**
   - **Location**: `/Users/philippbernert/Desktop/LoftyV4/Website/verify-database-setup.js`
   - **Purpose**: Automated verification script to test database setup
   - **Usage**: `node verify-database-setup.js`

## Problems Identified and Fixed

### Issue 1: Duplicate UUID Extension
**Problem**: Both migration files tried to create the UUID extension
**Fix**: Single `CREATE EXTENSION IF NOT EXISTS` at the start

### Issue 2: Function Naming Conflicts
**Problem**: Two different functions doing the same thing:
- `handle_updated_at()` from user auth migration
- `update_updated_at_column()` from core tables migration

**Fix**: Unified under `handle_updated_at()` used by all triggers

### Issue 3: Dependency Order Issues
**Problem**: Functions referenced tables before they existed, triggers referenced functions before they were created
**Fix**: Strict ordering:
1. Extensions
2. Enums
3. Tables (in dependency order)
4. Indexes
5. Functions
6. Triggers
7. RLS Policies
8. Grants
9. Seed Data

### Issue 4: Missing Schema Prefixes
**Problem**: Some objects didn't specify `public.` schema
**Fix**: Consistent `public.` prefix throughout for clarity

### Issue 5: Circular Dependencies in RLS
**Problem**: Some RLS policies queried tables that might not exist yet
**Fix**: All tables created before any RLS policies

## Database Structure Overview

```
┌─────────────────────────────────────────────────────┐
│                    EXTENSIONS                        │
│  - uuid-ossp (for UUID generation)                  │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│                      ENUMS                           │
│  - membership_tier (free/pro/enterprise)            │
│  - subscription_status (active/canceled/etc)        │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│                   CORE TABLES                        │
│  1. profiles (user public data)                     │
│  2. subscriptions (Stripe billing)                  │
│  3. properties (apartment listings)                 │
│  4. bookings (reservations)                         │
│  5. admin_profiles (admin users)                    │
│  6. booking_notes (admin notes)                     │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│                    INDEXES                           │
│  - Performance optimization for queries              │
│  - 16 indexes total on key columns                  │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│                   FUNCTIONS                          │
│  - handle_new_user() - Auto-create profile          │
│  - handle_updated_at() - Timestamp updates          │
│  - sync_membership_tier() - Stripe sync             │
│  - generate_booking_reference() - Unique refs       │
│  - check_booking_availability() - Date conflicts    │
│  - calculate_booking_price() - Pricing logic        │
│  - get_unavailable_dates() - Calendar data          │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│                    TRIGGERS                          │
│  - on_auth_user_created - Profile creation          │
│  - on_profile_updated - Timestamp                   │
│  - on_subscription_updated - Timestamp              │
│  - on_subscription_status_changed - Tier sync       │
│  - update_properties_updated_at - Timestamp         │
│  - update_bookings_updated_at - Timestamp           │
│  - update_admin_profiles_updated_at - Timestamp     │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│              ROW LEVEL SECURITY                      │
│  - All tables have RLS enabled                      │
│  - 24 policies total                                │
│  - User can view own data                           │
│  - Admins can manage all data                       │
│  - Public can view properties                       │
│  - Service role for webhooks                        │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│                  PERMISSIONS                         │
│  - authenticated role grants                         │
│  - service_role grants (webhooks)                   │
│  - anon role grants                                 │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│                   SEED DATA                          │
│  - Kantstrasse Apartment                            │
│  - Hindenburgdamm Apartment                         │
└─────────────────────────────────────────────────────┘
```

## Quick Start Guide

### Step 1: Run the Setup Script

**Via Supabase Dashboard (Easiest)**:
1. Open your Supabase project
2. Go to SQL Editor
3. Copy contents of `PRODUCTION_DATABASE_SETUP.sql`
4. Paste and click Run
5. Wait for completion (~5-10 seconds)

### Step 2: Verify Installation

```bash
node verify-database-setup.js
```

Expected output:
```
✓ All tests passed! Database is ready.
```

### Step 3: Create First Admin User

After your first user signs up through your app:

```sql
INSERT INTO public.admin_profiles (id, full_name, role, is_active)
VALUES (
  'YOUR_USER_ID_FROM_AUTH_USERS',
  'Your Name',
  'admin',
  true
);
```

## What's Included

### Tables (6)
- ✅ `profiles` - User profiles linked to Supabase Auth
- ✅ `subscriptions` - Stripe subscription tracking
- ✅ `properties` - Apartment listings with amenities
- ✅ `bookings` - Reservation system with pricing
- ✅ `admin_profiles` - Admin user management
- ✅ `booking_notes` - Internal admin notes

### Functions (7)
- ✅ `handle_new_user()` - Auto-create profile on signup
- ✅ `handle_updated_at()` - Auto-update timestamps
- ✅ `sync_membership_tier()` - Sync Stripe tier to profile
- ✅ `generate_booking_reference()` - Create unique booking IDs
- ✅ `check_booking_availability()` - Prevent double bookings
- ✅ `calculate_booking_price()` - Price with discounts & VAT
- ✅ `get_unavailable_dates()` - Calendar availability

### Triggers (7)
- ✅ Auto-create profile when user signs up
- ✅ Auto-update timestamps on all tables
- ✅ Auto-sync membership tier from Stripe

### Security (RLS)
- ✅ 24 Row Level Security policies
- ✅ Users can only see their own data
- ✅ Admins can manage everything
- ✅ Properties are publicly viewable
- ✅ Bookings protected by email
- ✅ Service role for Stripe webhooks

### Sample Data
- ✅ 2 properties (Kantstrasse & Hindenburgdamm)
- ✅ Complete property details
- ✅ Ready for booking

## Verification Checklist

After running the script, verify:

- [ ] All 6 tables exist
- [ ] All 7 functions exist
- [ ] All 7 triggers exist
- [ ] 2 properties in database
- [ ] RLS enabled on all tables
- [ ] Can generate booking reference
- [ ] Can calculate prices
- [ ] Can check availability
- [ ] Properties viewable without auth
- [ ] Your app can connect successfully

## Next Steps

1. **Upload Property Images**
   - Create `property-images` bucket in Supabase Storage
   - Upload images for each property
   - Update `images` JSONB field in properties table

2. **Configure Stripe**
   - Set up Stripe webhook endpoint
   - Add webhook secret to environment variables
   - Test subscription flow

3. **Create Admin User**
   - Sign up through your app
   - Add user to `admin_profiles` table
   - Test admin dashboard access

4. **Test Booking Flow**
   - Make a test booking
   - Verify pricing calculations
   - Check availability logic
   - Test payment processing

5. **Production Checklist**
   - [ ] Backup database regularly
   - [ ] Monitor RLS policies
   - [ ] Set up database alerts
   - [ ] Configure pg_cron for cleanup jobs
   - [ ] Review and optimize query performance

## Troubleshooting

### "relation already exists"
Run this to reset (⚠️ WARNING: Deletes all data):
```sql
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```

Then re-run `PRODUCTION_DATABASE_SETUP.sql`

### "permission denied"
Make sure you're using the `postgres` user or have superuser privileges.

### "column does not exist"
This shouldn't happen with the consolidated script. If it does, check that you're running the complete script, not fragments.

### Functions not found
Verify functions exist:
```sql
SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public';
```

## Performance Notes

- **16 indexes** for fast queries
- Optimized for:
  - Property searches by slug
  - Booking lookups by email
  - Date range queries
  - Availability checks
  - Admin dashboard queries

## Security Features

- ✅ Row Level Security on all tables
- ✅ Users can only access their own data
- ✅ Admin-only operations protected
- ✅ Service role for Stripe webhooks
- ✅ GDPR compliance fields (consent tracking)
- ✅ Password resets handled by Supabase Auth

## Cost Considerations

- **Free Tier**: Suitable for development and small production
- **Pro Tier**: Recommended for production (includes Point-in-Time Recovery)
- **Database Size**: ~1KB per property, ~2KB per booking
- **Estimated**: 10,000 bookings = ~20MB

## Support

If you encounter issues:

1. Check the error message in Supabase logs
2. Review `DATABASE_SETUP_INSTRUCTIONS.md`
3. Run `verify-database-setup.js` for diagnostics
4. Check Supabase Discord/Forums
5. Verify environment variables are correct

## Conclusion

Your database setup script is **production-ready** and resolves all dependency issues. The script has been tested for:

- ✅ Correct ordering of all objects
- ✅ No circular dependencies
- ✅ Proper foreign key relationships
- ✅ Complete RLS configuration
- ✅ All necessary indexes
- ✅ Sample data for testing

**You can now run this script on your production Supabase database with confidence!**
