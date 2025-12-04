#!/usr/bin/env node

/**
 * Automated Setup Script for SaaS Boilerplate
 *
 * This script automates:
 * - Starting Supabase local instance
 * - Fetching Supabase credentials
 * - Creating .env and .env.local files
 * - Starting Stripe webhook listener (optional)
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function header(message) {
  console.log('\n' + '='.repeat(60));
  log(message, 'bright');
  console.log('='.repeat(60) + '\n');
}

function checkCommand(command, name) {
  try {
    execSync(`which ${command}`, { stdio: 'ignore' });
    return true;
  } catch {
    log(`✗ ${name} is not installed`, 'red');
    return false;
  }
}

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  header('🚀 SaaS Boilerplate Setup');

  log('This script will automatically set up your local development environment.\n', 'cyan');

  // Step 1: Check prerequisites
  header('Step 1: Checking Prerequisites');

  const hasSupabase = checkCommand('supabase', 'Supabase CLI');
  const hasStripe = checkCommand('stripe', 'Stripe CLI');

  if (!hasSupabase) {
    log('\nPlease install Supabase CLI:', 'yellow');
    log('  npm install -g supabase', 'cyan');
    log('  or visit: https://supabase.com/docs/guides/cli\n', 'cyan');
    process.exit(1);
  }

  log('✓ Supabase CLI found', 'green');

  if (hasStripe) {
    log('✓ Stripe CLI found', 'green');
  } else {
    log('⚠ Stripe CLI not found (optional - you can set up webhooks later)', 'yellow');
    log('  Install from: https://stripe.com/docs/stripe-cli\n', 'cyan');
  }

  // Step 2: Ask for app name
  header('Step 2: App Configuration');

  const appName = await question('Enter your app name (default: SaaS Boilerplate): ');
  const finalAppName = appName.trim() || 'SaaS Boilerplate';
  log(`✓ App name set to: ${finalAppName}`, 'green');

  // Step 3: Start Supabase
  header('Step 3: Starting Supabase');

  log('Starting Supabase local instance (this may take a minute)...', 'cyan');

  try {
    execSync('supabase start', { stdio: 'inherit' });
    log('\n✓ Supabase started successfully', 'green');
  } catch (error) {
    log('\n✗ Failed to start Supabase', 'red');
    log('Make sure Docker is running and try again.', 'yellow');
    process.exit(1);
  }

  // Step 4: Get Supabase credentials
  header('Step 4: Fetching Supabase Credentials');

  let supabaseEnv = {};

  try {
    const output = execSync('supabase status -o env', { encoding: 'utf-8' });

    // Parse the output
    output.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        supabaseEnv[key.trim()] = value.trim().replace(/^["']|["']$/g, '');
      }
    });

    log('✓ Supabase credentials fetched', 'green');
  } catch (error) {
    log('✗ Failed to fetch Supabase credentials', 'red');
    process.exit(1);
  }

  // Step 5: Create .env file
  header('Step 5: Creating Environment Files');

  const envContent = `# Supabase Environment Variables
# Local development configuration for Supabase

# Core API Configuration
SUPABASE_URL=${supabaseEnv.SUPABASE_URL || 'http://127.0.0.1:54321'}
SUPABASE_API_URL=${supabaseEnv.SUPABASE_API_URL || 'http://127.0.0.1:54321'}

# Authentication Keys
SUPABASE_ANON_KEY=${supabaseEnv.SUPABASE_ANON_KEY || ''}
SUPABASE_SERVICE_ROLE_KEY=${supabaseEnv.SUPABASE_SERVICE_ROLE_KEY || ''}

# Database Configuration
SUPABASE_DB_URL=${supabaseEnv.SUPABASE_DB_URL || ''}
DATABASE_URL=${supabaseEnv.SUPABASE_DB_URL || ''}

# Additional Service URLs
SUPABASE_GRAPHQL_URL=${supabaseEnv.SUPABASE_GRAPHQL_URL || ''}
SUPABASE_STORAGE_URL=${supabaseEnv.SUPABASE_STORAGE_URL || ''}
SUPABASE_STORAGE_S3_URL=${supabaseEnv.SUPABASE_STORAGE_S3_URL || ''}
SUPABASE_MCP_URL=${supabaseEnv.SUPABASE_MCP_URL || ''}

# Studio and Admin URLs (Local Development)
SUPABASE_STUDIO_URL=${supabaseEnv.SUPABASE_STUDIO_URL || ''}
SUPABASE_MAILPIT_URL=${supabaseEnv.SUPABASE_MAILPIT_URL || ''}

# S3 Storage Configuration
SUPABASE_S3_ACCESS_KEY=${supabaseEnv.SUPABASE_S3_ACCESS_KEY || ''}
SUPABASE_S3_SECRET_KEY=${supabaseEnv.SUPABASE_S3_SECRET_KEY || ''}
SUPABASE_S3_REGION=${supabaseEnv.SUPABASE_S3_REGION || 'local'}

# Publishable and Secret Keys
SUPABASE_PUBLISHABLE_KEY=${supabaseEnv.SUPABASE_ANON_KEY || ''}
SUPABASE_SECRET_KEY=${supabaseEnv.SUPABASE_SERVICE_ROLE_KEY || ''}

# Stripe Configuration
# ⚠️ TODO: Add your Stripe API keys from https://dashboard.stripe.com/test/apikeys
STRIPE_PUBLISHABLE_KEY=pk_test_your-publishable-key-here
STRIPE_SECRET_KEY=sk_test_your-secret-key-here
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret-here

# Stripe Product IDs
# ⚠️ TODO: Create products in Stripe Dashboard and add the IDs here
# https://dashboard.stripe.com/products
STRIPE_PRODUCT_PRO=prod_your-pro-product-id-here
STRIPE_PRODUCT_ENTERPRISE=prod_your-enterprise-product-id-here

# Stripe Price IDs
# ⚠️ TODO: Create prices under each product and add the IDs here
STRIPE_PRICE_PRO_MONTHLY=price_your-pro-monthly-price-id-here
STRIPE_PRICE_PRO_YEARLY=price_your-pro-yearly-price-id-here
STRIPE_PRICE_ENTERPRISE_MONTHLY=price_your-enterprise-monthly-price-id-here
STRIPE_PRICE_ENTERPRISE_YEARLY=price_your-enterprise-yearly-price-id-here

# Application Configuration
APP_NAME=${finalAppName}
`;

  const envLocalContent = `# Supabase Environment Variables for Next.js
# Local development configuration

# Public Supabase URLs (accessible in browser)
NEXT_PUBLIC_SUPABASE_URL=${supabaseEnv.SUPABASE_URL || 'http://127.0.0.1:54321'}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${supabaseEnv.SUPABASE_ANON_KEY || ''}

# Server-side only variables
SUPABASE_SERVICE_ROLE_KEY=${supabaseEnv.SUPABASE_SERVICE_ROLE_KEY || ''}
DATABASE_URL=${supabaseEnv.SUPABASE_DB_URL || ''}

# Stripe Configuration
# ⚠️ TODO: Add your Stripe API keys from https://dashboard.stripe.com/test/apikeys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your-publishable-key-here
STRIPE_SECRET_KEY=sk_test_your-secret-key-here
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret-here

# Stripe Product IDs
# ⚠️ TODO: Create products in Stripe Dashboard and add the IDs here
STRIPE_PRODUCT_PRO=prod_your-pro-product-id-here
STRIPE_PRODUCT_ENTERPRISE=prod_your-enterprise-product-id-here

# Stripe Price IDs
# ⚠️ TODO: Create prices under each product and add the IDs here
STRIPE_PRICE_PRO_MONTHLY=price_your-pro-monthly-price-id-here
STRIPE_PRICE_PRO_YEARLY=price_your-pro-yearly-price-id-here
STRIPE_PRICE_ENTERPRISE_MONTHLY=price_your-enterprise-monthly-price-id-here
STRIPE_PRICE_ENTERPRISE_YEARLY=price_your-enterprise-yearly-price-id-here

# Application Configuration
NEXT_PUBLIC_APP_NAME=${finalAppName}
`;

  try {
    fs.writeFileSync(path.join(process.cwd(), '.env'), envContent);
    log('✓ Created .env file', 'green');

    fs.writeFileSync(path.join(process.cwd(), '.env.local'), envLocalContent);
    log('✓ Created .env.local file', 'green');
  } catch (error) {
    log('✗ Failed to create environment files', 'red');
    console.error(error);
    process.exit(1);
  }

  // Step 6: Stripe webhook setup (optional)
  if (hasStripe) {
    header('Step 6: Stripe Webhook Setup (Optional)');

    const setupStripe = await question('Do you want to set up Stripe webhooks now? (y/N): ');

    if (setupStripe.toLowerCase() === 'y') {
      log('\nStarting Stripe webhook listener...', 'cyan');
      log('This will run in the background. Press Ctrl+C to stop it later.\n', 'yellow');

      const stripeProcess = spawn('stripe', [
        'listen',
        '--forward-to',
        'localhost:3000/api/webhooks/stripe',
        '--print-secret'
      ], {
        stdio: 'pipe'
      });

      let webhookSecret = '';

      stripeProcess.stdout.on('data', (data) => {
        const output = data.toString();
        console.log(output);

        // Try to extract webhook secret
        const match = output.match(/whsec_[a-zA-Z0-9]+/);
        if (match && !webhookSecret) {
          webhookSecret = match[0];

          // Update .env files with webhook secret
          const envPath = path.join(process.cwd(), '.env');
          const envLocalPath = path.join(process.cwd(), '.env.local');

          let envContent = fs.readFileSync(envPath, 'utf-8');
          let envLocalContent = fs.readFileSync(envLocalPath, 'utf-8');

          envContent = envContent.replace(
            'STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret-here',
            `STRIPE_WEBHOOK_SECRET=${webhookSecret}`
          );

          envLocalContent = envLocalContent.replace(
            'STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret-here',
            `STRIPE_WEBHOOK_SECRET=${webhookSecret}`
          );

          fs.writeFileSync(envPath, envContent);
          fs.writeFileSync(envLocalPath, envLocalContent);

          log(`\n✓ Stripe webhook secret saved: ${webhookSecret}`, 'green');
          log('\nStripe listener is running in the background.', 'cyan');
          log('Keep this terminal open while developing.\n', 'yellow');
        }
      });

      stripeProcess.stderr.on('data', (data) => {
        console.error(data.toString());
      });

      // Wait a bit for the webhook secret
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Detach the process so it keeps running
      stripeProcess.unref();
    } else {
      log('\nSkipping Stripe webhook setup.', 'yellow');
      log('You can set it up later by running:', 'cyan');
      log('  stripe listen --forward-to localhost:3000/api/webhooks/stripe\n', 'cyan');
    }
  }

  // Final instructions
  header('✅ Setup Complete!');

  log('Your environment is ready! Here\'s what was configured:\n', 'green');
  log('✓ Supabase local instance running', 'green');
  log('✓ Environment files created (.env and .env.local)', 'green');
  log('✓ Supabase credentials populated', 'green');
  if (hasStripe) {
    log('✓ Stripe webhook listener configured', 'green');
  }

  log('\n📝 Next Steps:\n', 'bright');
  log('1. Add your Stripe API keys to .env and .env.local', 'cyan');
  log('   Get them from: https://dashboard.stripe.com/test/apikeys\n', 'yellow');

  log('2. Create products in Stripe Dashboard:', 'cyan');
  log('   https://dashboard.stripe.com/products', 'yellow');
  log('   - Create a "Pro" product with monthly and yearly prices', 'yellow');
  log('   - Create an "Enterprise" product with monthly and yearly prices', 'yellow');
  log('   - Add the product and price IDs to .env files\n', 'yellow');

  log('3. Start the development server:', 'cyan');
  log('   npm run dev\n', 'yellow');

  log('4. Open your browser:', 'cyan');
  log('   http://localhost:3000', 'yellow');
  log('   Supabase Studio: http://127.0.0.1:54343', 'yellow');
  log('   Mailpit (emails): http://127.0.0.1:54344\n', 'yellow');

  log('📚 For detailed instructions, see README.md\n', 'bright');

  rl.close();
}

main().catch(error => {
  log('\n✗ Setup failed:', 'red');
  console.error(error);
  process.exit(1);
});
