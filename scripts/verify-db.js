/**
 * Database verification script
 * Queries subscriptions and profiles tables to check cancellation status
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load .env.local manually
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim();
  }
});

const supabase = createClient(
  envVars.NEXT_PUBLIC_SUPABASE_URL,
  envVars.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

async function verifyDatabase() {
  console.log('=== DATABASE VERIFICATION ===\n');

  // Query subscriptions
  console.log('Querying subscriptions table...');
  const { data: subscriptions, error: subError } = await supabase
    .from('subscriptions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  if (subError) {
    console.error('Error querying subscriptions:', subError);
  } else {
    console.log('\nSubscriptions (latest 5):');
    console.log(JSON.stringify(subscriptions, null, 2));
  }

  // Query profiles
  console.log('\n\nQuerying profiles table...');
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('id, email, membership_tier, created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  if (profileError) {
    console.error('Error querying profiles:', profileError);
  } else {
    console.log('\nProfiles (latest 5):');
    console.log(JSON.stringify(profiles, null, 2));
  }

  // Check for canceled subscriptions
  console.log('\n\nChecking for canceled subscriptions...');
  const { data: canceled, error: cancelError } = await supabase
    .from('subscriptions')
    .select('*')
    .or('status.eq.canceled,cancel_at_period_end.eq.true')
    .order('updated_at', { ascending: false })
    .limit(3);

  if (cancelError) {
    console.error('Error querying canceled subscriptions:', cancelError);
  } else {
    console.log('\nCanceled/Pending Cancellation Subscriptions:');
    console.log(JSON.stringify(canceled, null, 2));
  }
}

verifyDatabase()
  .then(() => {
    console.log('\n=== VERIFICATION COMPLETE ===');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Verification failed:', error);
    process.exit(1);
  });
