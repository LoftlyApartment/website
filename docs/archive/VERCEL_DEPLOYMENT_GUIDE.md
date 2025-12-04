# Vercel Deployment Guide - Step by Step

## Problem: Local Supabase Won't Work on Vercel

Your current `.env` file uses **LOCAL Supabase** (http://127.0.0.1:54341), which only works on your computer. Vercel needs a **cloud Supabase project**.

---

## Step 1: Create a Production Supabase Project

### Option A: Use Supabase Cloud (Recommended)

1. Go to https://supabase.com
2. Click "Start your project" or "Sign in"
3. Click "New Project"
4. Fill in:
   - **Name:** Lofty Apartments Production
   - **Database Password:** Choose a strong password (save it!)
   - **Region:** Choose closest to your users (e.g., Europe for Berlin)
5. Click "Create new project"
6. Wait 2-3 minutes for setup to complete

### Option B: Use Your Local Supabase for Testing

If you just want to test the deployment without creating a production database:
- You can use the local credentials temporarily
- But the site won't have database functionality when deployed
- NOT recommended for production

---

## Step 2: Get Your Production Supabase Credentials

After your Supabase project is created:

1. In Supabase dashboard, go to **Project Settings** (gear icon on left sidebar)
2. Click **API** in the left menu
3. You'll see:

**Copy these values:**
- **Project URL** (starts with https://xxx.supabase.co)
  → Use for `NEXT_PUBLIC_SUPABASE_URL`

- **anon/public key** (long JWT token under "Project API keys")
  → Use for `NEXT_PUBLIC_SUPABASE_ANON_KEY`

- **service_role key** (below anon key, click "Reveal" to see it)
  → Use for `SUPABASE_SERVICE_ROLE_KEY`

---

## Step 3: Update Your .env.production File

Open the file I just created: `.env.production`

Replace these three lines with your actual values:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.YOUR_ACTUAL_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.YOUR_ACTUAL_SERVICE_ROLE_KEY
```

---

## Step 4: Add Environment Variables to Vercel

You have **TWO OPTIONS**:

### Option A: Import .env File (EASIEST!)

1. In your Vercel screenshot, click the **"Import .env"** button (you can see it in your screenshot)
2. Select the `.env.production` file
3. All variables will be imported automatically
4. Click **"Save"**
5. Done!

### Option B: Add Manually (One by One)

1. In the **Key** field, type: `NEXT_PUBLIC_SUPABASE_URL`
2. In the **Value** field, paste: Your production Supabase URL
3. Click **"Add Another"**
4. Repeat for each variable:
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `NEXT_PUBLIC_APP_NAME`
5. Click **"Save"** when done

---

## Step 5: Set Up Your Database Tables

After setting up Supabase, you need to create the database tables:

1. In Supabase dashboard, click **SQL Editor** (on left sidebar)
2. Run the migration files in this order:
   - `supabase/migrations/20251025175702_user_authentication_and_memberships.sql`
   - `supabase/migrations/20251030000001_create_core_tables.sql`
   - `supabase/migrations/20251030000002_create_functions_and_triggers.sql`
   - `supabase/migrations/20251030000003_create_rls_policies.sql`
   - `supabase/migrations/20251030000004_seed_data.sql`

Or use Supabase CLI:
```bash
# Link to your production project
supabase link --project-ref your-project-ref

# Push all migrations
supabase db push
```

---

## Step 6: Set Up Stripe Webhook for Production

1. Go to https://dashboard.stripe.com/webhooks
2. Click **"Add endpoint"**
3. Enter your Vercel URL: `https://your-vercel-app.vercel.app/api/webhooks/stripe`
4. Select these events:
   - customer.subscription.created
   - customer.subscription.updated
   - customer.subscription.deleted
   - invoice.payment_succeeded
   - invoice.payment_failed
5. Click "Add endpoint"
6. Copy the **Signing secret** (starts with whsec_)
7. Add it to Vercel as `STRIPE_WEBHOOK_SECRET`

---

## Step 7: Redeploy on Vercel

After adding all environment variables:

1. Go to your Vercel project dashboard
2. Click **"Deployments"** tab
3. Click the **"..."** menu on the latest deployment
4. Click **"Redeploy"**
5. Check "Use existing Build Cache" is OFF
6. Click **"Redeploy"**

---

## Quick Reference: Required Environment Variables

| Variable | Where to Get It | Example |
|----------|----------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project Settings > API | https://xxx.supabase.co |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Project Settings > API | eyJhbGciOiJIUzI1NiIs... |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Project Settings > API (click Reveal) | eyJhbGciOiJIUzI1NiIs... |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Dashboard > Developers > API Keys | pk_test_... |
| `STRIPE_SECRET_KEY` | Stripe Dashboard > Developers > API Keys | sk_test_... |
| `STRIPE_WEBHOOK_SECRET` | Stripe Dashboard > Webhooks > Endpoint | whsec_... |
| `NEXT_PUBLIC_APP_NAME` | Just a name | Lofty Apartments |

---

## Troubleshooting

**"I don't want to create a production Supabase yet"**
- You can use your local Supabase for testing
- BUT your deployed site won't have a working database
- Users won't be able to make bookings
- Authentication won't work

**"Which Stripe keys should I use?"**
- For testing: Use test keys (pk_test_, sk_test_)
- For production: Use live keys (pk_live_, sk_live_)
- You have test keys in your .env already ✓

**"The webhook secret is different"**
- Local webhook secret (from `stripe listen`) only works locally
- Production webhook secret comes from Stripe Dashboard after adding the endpoint

---

## Next Steps

1. Create Supabase cloud project
2. Get production credentials
3. Update `.env.production` file with real values
4. Use "Import .env" button in Vercel (from your screenshot!)
5. Redeploy

**Need help?** Let me know which step you're stuck on!
