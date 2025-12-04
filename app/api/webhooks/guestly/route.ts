/**
 * Guestly Webhook Handler
 *
 * Receives and processes webhook events from Guestly for two-way booking synchronization
 * Supports events: reservation.created, reservation.updated, reservation.canceled, listing.calendar.updated
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { processWebhookEvent } from '@/lib/guestly/webhook-sync';
import type { WebhookEvent } from '@/lib/guestly/webhook-sync';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ============================================================================
// Configuration
// ============================================================================

/**
 * Get Supabase admin client for webhook logging
 */
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Supabase credentials are not configured. Please add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to your environment variables.'
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Check if webhook processing is enabled
 */
function isWebhookEnabled(): boolean {
  return process.env.GUESTLY_WEBHOOK_ENABLED !== 'false';
}

/**
 * Get webhook secret for signature verification
 */
function getWebhookSecret(): string | null {
  return process.env.GUESTLY_WEBHOOK_SECRET || null;
}

// ============================================================================
// Security & Validation
// ============================================================================

/**
 * Verify webhook signature if secret is configured
 * Note: Guestly webhook signature format should be documented in their API docs
 */
function verifyWebhookSignature(
  payload: string,
  signature: string | null,
  secret: string | null
): boolean {
  // If no secret configured, skip verification (for development)
  if (!secret) {
    console.warn('GUESTLY_WEBHOOK_SECRET not configured - skipping signature verification');
    return true;
  }

  // If secret is configured but no signature provided, reject
  if (!signature) {
    console.error('Webhook signature required but not provided');
    return false;
  }

  // TODO: Implement Guestly's signature verification algorithm
  // This depends on how Guestly signs their webhooks (HMAC-SHA256, etc.)
  // For now, we'll use a simple comparison as a placeholder
  try {
    // Example using Node's crypto for HMAC-SHA256 verification:
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    const isValid = signature === expectedSignature || signature === `sha256=${expectedSignature}`;

    if (!isValid) {
      console.error('Webhook signature verification failed');
    }

    return isValid;
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return false;
  }
}

/**
 * Validate webhook payload structure
 */
function isValidWebhookPayload(data: any): data is WebhookEvent {
  return (
    data &&
    typeof data === 'object' &&
    typeof data.event_type === 'string' &&
    data.data !== undefined
  );
}

// ============================================================================
// Webhook Logging
// ============================================================================

/**
 * Log webhook event to database for audit trail
 */
async function logWebhookEvent(
  eventId: string | null,
  eventType: string,
  payload: any,
  status: 'received' | 'processing' | 'success' | 'failed',
  error?: string
): Promise<string | null> {
  try {
    const supabase = getSupabaseAdmin();

    const logData: any = {
      event_id: eventId,
      event_type: eventType,
      source: 'guestly',
      payload,
      status,
      error: error || null,
    };

    if (status === 'success') {
      logData.processed_at = new Date().toISOString();
    }

    const { data, error: logError } = await supabase
      .from('webhook_logs')
      .insert(logData)
      .select('id')
      .single();

    if (logError) {
      console.error('Error logging webhook event:', logError);
      return null;
    }

    return data.id;
  } catch (error) {
    console.error('Error in logWebhookEvent:', error);
    return null;
  }
}

/**
 * Update webhook log status
 */
async function updateWebhookLog(
  logId: string,
  status: 'success' | 'failed',
  error?: string
): Promise<void> {
  try {
    const supabase = getSupabaseAdmin();

    const updateData: any = {
      status,
      error: error || null,
    };

    if (status === 'success') {
      updateData.processed_at = new Date().toISOString();
    }

    await supabase.from('webhook_logs').update(updateData).eq('id', logId);
  } catch (error) {
    console.error('Error updating webhook log:', error);
  }
}

// ============================================================================
// Admin Alerting
// ============================================================================

/**
 * Send admin alert for critical webhook failures
 */
async function sendWebhookFailureAlert(
  eventType: string,
  error: string,
  payload: any
): Promise<void> {
  try {
    // Log to console (can be picked up by monitoring tools)
    console.error('CRITICAL WEBHOOK FAILURE:', {
      eventType,
      error,
      timestamp: new Date().toISOString(),
      payload: JSON.stringify(payload).substring(0, 500), // Truncate for logging
    });

    // TODO: Implement email/Slack notification if needed
    // Example: await sendEmail(adminEmail, subject, message);
    // Example: await sendSlackMessage(webhookUrl, message);
  } catch (alertError) {
    console.error('Error sending webhook failure alert:', alertError);
  }
}

// ============================================================================
// Main Webhook Handler
// ============================================================================

export async function POST(request: NextRequest) {
  let webhookLogId: string | null = null;

  try {
    // Check if webhooks are enabled
    if (!isWebhookEnabled()) {
      console.log('Guestly webhooks are disabled via GUESTLY_WEBHOOK_ENABLED environment variable');
      return NextResponse.json(
        { error: 'Webhooks are disabled' },
        { status: 503 }
      );
    }

    // Get request body and headers
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('x-guestly-signature') || headersList.get('x-webhook-signature');
    const eventId = headersList.get('x-guestly-event-id') || headersList.get('x-event-id');

    // Verify webhook signature
    const webhookSecret = getWebhookSecret();
    const isValidSignature = verifyWebhookSignature(body, signature, webhookSecret);

    if (!isValidSignature) {
      console.error('Webhook signature verification failed');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Parse JSON payload
    let payload: any;
    try {
      payload = JSON.parse(body);
    } catch (parseError) {
      console.error('Error parsing webhook payload:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }

    // Validate payload structure
    if (!isValidWebhookPayload(payload)) {
      console.error('Invalid webhook payload structure:', payload);
      return NextResponse.json(
        { error: 'Invalid payload structure' },
        { status: 400 }
      );
    }

    // Log webhook receipt
    webhookLogId = await logWebhookEvent(
      eventId,
      payload.event_type,
      payload,
      'received'
    );

    console.log(`Received Guestly webhook: ${payload.event_type}`, {
      eventId,
      logId: webhookLogId,
    });

    // Update log to processing
    if (webhookLogId) {
      await updateWebhookLog(webhookLogId, 'success'); // Mark as received
    }

    // Process webhook event asynchronously
    // We return 200 immediately to acknowledge receipt
    // Processing happens in background to prevent timeout
    processWebhookAsync(payload, webhookLogId).catch(error => {
      console.error('Error in async webhook processing:', error);
    });

    // Return success response
    return NextResponse.json({
      received: true,
      eventType: payload.event_type,
      eventId,
    });

  } catch (error) {
    console.error('Webhook handler error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Update webhook log with error
    if (webhookLogId) {
      await updateWebhookLog(webhookLogId, 'failed', errorMessage);
    }

    // Always return 200 to prevent Guestly from retrying
    // (retries can cause duplicate bookings)
    return NextResponse.json(
      {
        received: true,
        error: 'Processing failed but acknowledged',
      },
      { status: 200 }
    );
  }
}

/**
 * Process webhook asynchronously after acknowledging receipt
 */
async function processWebhookAsync(
  payload: WebhookEvent,
  webhookLogId: string | null
): Promise<void> {
  try {
    console.log(`Processing webhook event: ${payload.event_type}`);

    // Process the event
    const result = await processWebhookEvent(payload);

    if (result.success) {
      console.log(`Successfully processed ${payload.event_type}`, {
        action: result.action,
        bookingId: result.bookingId,
      });

      // Update webhook log to success
      if (webhookLogId) {
        await updateWebhookLog(webhookLogId, 'success');
      }
    } else {
      console.error(`Failed to process ${payload.event_type}:`, result.error);

      // Update webhook log with error
      if (webhookLogId) {
        await updateWebhookLog(webhookLogId, 'failed', result.error);
      }

      // Send admin alert for critical failures
      await sendWebhookFailureAlert(
        payload.event_type,
        result.error || 'Unknown error',
        payload
      );
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in processWebhookAsync:', error);

    // Update webhook log with error
    if (webhookLogId) {
      await updateWebhookLog(webhookLogId, 'failed', errorMessage);
    }

    // Send admin alert
    await sendWebhookFailureAlert(payload.event_type, errorMessage, payload);
  }
}

// ============================================================================
// Health Check Endpoint (Optional)
// ============================================================================

/**
 * GET endpoint for webhook health check
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'guestly-webhook',
    enabled: isWebhookEnabled(),
    timestamp: new Date().toISOString(),
  });
}
