# Stripe and Supabase Build Fix - Complete Summary

## Problem
Vercel build was failing during "Collecting page data" phase with errors:
```
Error: Neither apiKey nor config.authenticator provided
Error: Failed to collect page data for /api/stripe/checkout
```

## Root Cause
Next.js executes API route code during build to collect metadata and determine which routes can be statically optimized. When Stripe or Supabase clients are initialized at module level (outside of request handlers), they attempt to access environment variables that may not be available during build time, causing initialization errors.

## Solution Applied

### 1. Fixed API Route: `/app/api/stripe/checkout/route.ts`
**Changes:**
- Changed import from `stripe` proxy to `getStripe()` lazy initialization function
- Added `export const dynamic = 'force-dynamic'` to prevent static optimization
- Added `export const runtime = 'nodejs'` to ensure Node.js runtime
- Initialize Stripe client INSIDE the POST handler: `const stripe = getStripe();`

**Before:**
```typescript
import { stripe } from '@/lib/stripe/server';

export async function POST(request: NextRequest) {
  // stripe is used here...
}
```

**After:**
```typescript
import { getStripe } from '@/lib/stripe/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  // stripe is used here...
}
```

### 2. Fixed API Route: `/app/api/stripe/portal/route.ts`
**Changes:** Same as checkout route
- Changed import from `stripe` proxy to `getStripe()`
- Added `dynamic` and `runtime` exports
- Initialize Stripe inside POST handler

### 3. Fixed API Route: `/app/api/stripe/webhook/route.ts`
**Changes:**
- Added `export const dynamic = 'force-dynamic'`
- Added `export const runtime = 'nodejs'`
- Already had lazy initialization with local `getStripeClient()` function

### 4. Fixed API Route: `/app/api/stripe/create-payment-intent/route.ts`
**Changes:**
- Added `export const dynamic = 'force-dynamic'`
- Added `export const runtime = 'nodejs'`
- Already had lazy initialization with local `getStripeClient()` function

### 5. Fixed Webhook Route: `/app/api/webhooks/stripe/route.ts`
**Status:** Already properly configured
- Already had `export const runtime = 'nodejs'`
- Already had `export const dynamic = 'force-dynamic'`
- Uses `getStripe()` lazy initialization
- Uses `getSupabaseAdmin()` lazy initialization

## Files Modified
1. `/app/api/stripe/checkout/route.ts`
2. `/app/api/stripe/portal/route.ts`
3. `/app/api/stripe/webhook/route.ts`
4. `/app/api/stripe/create-payment-intent/route.ts`

## Files Already Correct
- `/lib/stripe/server.ts` - Has lazy initialization with `getStripe()`
- `/integrations/stripe/client.ts` - Has lazy initialization with proxy
- `/app/api/webhooks/stripe/route.ts` - Already properly configured
- `/lib/supabase/server.ts` - Admin client is a function, not module-level instance

## Build Results

### Before Fix:
```
Error: Neither apiKey nor config.authenticator provided
Error: Failed to collect page data for /api/stripe/checkout
```

### After Fix:
```
✓ Compiled successfully
✓ Generating static pages (45/45) in 349.3ms
✓ Build completed successfully

Route (app)
├ ƒ /api/stripe/checkout        (Dynamic)
├ ƒ /api/stripe/create-payment-intent (Dynamic)
├ ƒ /api/stripe/portal          (Dynamic)
├ ƒ /api/stripe/webhook         (Dynamic)
├ ƒ /api/webhooks/stripe        (Dynamic)
```

## Key Principles Applied

### 1. Lazy Initialization
Never initialize Stripe or Supabase clients at module level. Always initialize inside request handlers:

```typescript
// ❌ BAD - Module level initialization
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST() {
  // Use stripe...
}

// ✅ GOOD - Lazy initialization
export async function POST() {
  const stripe = getStripe(); // Initialize on demand
  // Use stripe...
}
```

### 2. Prevent Static Optimization
API routes that use environment variables must be marked as dynamic:

```typescript
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
```

This prevents Next.js from trying to statically optimize these routes during build.

### 3. Use Helper Functions
Use `getStripe()` or `getStripeClient()` helper functions that check for environment variables and throw clear errors if missing, rather than importing pre-initialized instances.

## Testing
Build tested successfully:
```bash
npm run build
```

Result:
- ✓ 45 routes generated
- ✓ All API routes marked as dynamic (ƒ)
- ✓ No initialization errors
- ✓ No "Failed to collect page data" errors
- ✓ Build time: ~3 seconds compilation + ~350ms static generation

## Deployment Readiness
This build is now ready for Vercel deployment. All Stripe and Supabase initialization errors have been resolved.

## Environment Variables Required
Ensure these are set in Vercel:
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- All Stripe price/product IDs

---
**Fix completed:** November 11, 2025
**Build status:** ✓ Passing
**Deployment status:** Ready for Vercel
