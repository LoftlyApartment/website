/**
 * Guestly Webhook Testing Utility
 * Send test webhook events to your local/staging webhook endpoint
 *
 * Usage:
 *   npm run test-webhook [event-type]
 *
 * Examples:
 *   npm run test-webhook reservation.created
 *   npm run test-webhook reservation.updated
 *   npm run test-webhook reservation.canceled
 *   npm run test-webhook listing.calendar.updated
 */

import {
  allTestPayloads,
  generateTestSignature,
} from './webhook-test-payloads';

// ============================================================================
// Configuration
// ============================================================================

const WEBHOOK_URL =
  process.env.WEBHOOK_TEST_URL ||
  'http://localhost:3000/api/webhooks/guestly';

const WEBHOOK_SECRET =
  process.env.GUESTLY_WEBHOOK_SECRET || 'test-webhook-secret';

// ============================================================================
// Test Webhook Sender
// ============================================================================

interface SendWebhookOptions {
  url?: string;
  secret?: string;
  includeSignature?: boolean;
}

/**
 * Send test webhook to endpoint
 */
async function sendTestWebhook(
  eventType: keyof typeof allTestPayloads,
  options: SendWebhookOptions = {}
): Promise<void> {
  const {
    url = WEBHOOK_URL,
    secret = WEBHOOK_SECRET,
    includeSignature = true,
  } = options;

  const payload = allTestPayloads[eventType];

  if (!payload) {
    console.error(`Unknown event type: ${eventType}`);
    console.log('Available event types:');
    Object.keys(allTestPayloads).forEach(key => console.log(`  - ${key}`));
    return;
  }

  console.log('\n='.repeat(60));
  console.log(`Sending test webhook: ${payload.event_type}`);
  console.log('='.repeat(60));
  console.log(`URL: ${url}`);
  console.log(`Event ID: ${payload.event_id}`);
  console.log(`Timestamp: ${payload.timestamp}`);
  console.log('\nPayload:');
  console.log(JSON.stringify(payload, null, 2));
  console.log('\n' + '-'.repeat(60));

  try {
    const payloadString = JSON.stringify(payload);
    const signature = includeSignature
      ? generateTestSignature(payload, secret)
      : null;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-guestly-event-id': payload.event_id,
    };

    if (signature) {
      headers['x-guestly-signature'] = signature;
      console.log(`Signature: ${signature.substring(0, 20)}...`);
    } else {
      console.log('Signature: [not included]');
    }

    console.log('\nSending request...\n');

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: payloadString,
    });

    console.log(`Response Status: ${response.status} ${response.statusText}`);

    const responseData = await response.json();
    console.log('Response Body:');
    console.log(JSON.stringify(responseData, null, 2));

    if (response.ok) {
      console.log('\n✅ Webhook sent successfully!');
    } else {
      console.log('\n❌ Webhook failed!');
    }
  } catch (error) {
    console.error('\n❌ Error sending webhook:');
    console.error(error);
  }

  console.log('='.repeat(60) + '\n');
}

/**
 * Send all test webhooks in sequence
 */
async function sendAllTestWebhooks(
  options: SendWebhookOptions = {}
): Promise<void> {
  console.log('\n🚀 Sending all test webhooks...\n');

  for (const eventType of Object.keys(allTestPayloads)) {
    await sendTestWebhook(
      eventType as keyof typeof allTestPayloads,
      options
    );
    // Wait 1 second between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('✅ All test webhooks sent!\n');
}

// ============================================================================
// CLI Interface
// ============================================================================

/**
 * Main function for CLI usage
 */
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const eventType = args[0];

  if (!eventType) {
    console.log('\nGuestly Webhook Testing Utility\n');
    console.log('Usage:');
    console.log('  npm run test-webhook [event-type]\n');
    console.log('Available event types:');
    Object.entries(allTestPayloads).forEach(([key, payload]) => {
      console.log(`  ${key.padEnd(30)} -> ${payload.event_type}`);
    });
    console.log('\nSpecial commands:');
    console.log('  all                            -> Send all test webhooks\n');
    console.log('Examples:');
    console.log('  npm run test-webhook reservationCreated');
    console.log('  npm run test-webhook all');
    console.log('\nEnvironment variables:');
    console.log(`  WEBHOOK_TEST_URL="${WEBHOOK_URL}"`);
    console.log(`  GUESTLY_WEBHOOK_SECRET="${WEBHOOK_SECRET}"\n`);
    return;
  }

  if (eventType === 'all') {
    await sendAllTestWebhooks();
  } else {
    // Convert kebab-case or snake_case to camelCase
    const camelCaseEventType = eventType.replace(/[-_](.)/g, (_, char) =>
      char.toUpperCase()
    );

    await sendTestWebhook(camelCaseEventType as keyof typeof allTestPayloads);
  }
}

// ============================================================================
// Export for programmatic use
// ============================================================================

export { sendTestWebhook, sendAllTestWebhooks };

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}
