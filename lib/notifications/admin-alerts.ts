/**
 * Admin Alert Notifications
 * Sends email alerts to administrators for critical events
 */

import type { BookingData } from '@/lib/guestly/sync';

// ============================================================================
// Configuration
// ============================================================================

/**
 * Get admin email from environment
 */
function getAdminEmail(): string | null {
  return process.env.ADMIN_ALERT_EMAIL || null;
}

/**
 * Check if admin notifications are enabled
 */
function isNotificationEnabled(): boolean {
  return !!getAdminEmail();
}

// ============================================================================
// Email Sending
// ============================================================================

/**
 * Send email via your preferred email service
 * This is a placeholder - integrate with your actual email service
 * (e.g., SendGrid, AWS SES, Resend, etc.)
 */
async function sendEmail(
  to: string,
  subject: string,
  _htmlBody: string, // Prefixed with _ to indicate intentionally unused
  textBody: string
): Promise<boolean> {
  try {
    // TODO: Integrate with actual email service
    // Example with fetch to a generic API:
    /*
    const response = await fetch(process.env.EMAIL_API_ENDPOINT!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.EMAIL_API_KEY}`,
      },
      body: JSON.stringify({
        to,
        subject,
        html: htmlBody,
        text: textBody,
      }),
    });

    return response.ok;
    */

    // For now, just log to console
    console.log('EMAIL NOTIFICATION:');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('Body:', textBody);
    console.log('---');

    return true;

  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

// ============================================================================
// Alert Templates
// ============================================================================

/**
 * Format booking details for email
 */
function formatBookingDetails(booking: BookingData): string {
  return `
Booking Reference: ${booking.booking_reference}
Guest: ${booking.guest_first_name} ${booking.guest_last_name}
Email: ${booking.guest_email}
Phone: ${booking.guest_phone}
Check-in: ${booking.check_in_date}
Check-out: ${booking.check_out_date}
Guests: ${booking.adults} adults, ${booking.children} children, ${booking.infants} infants
Total: €${booking.total}
Payment Status: ${booking.payment_status}
Booking Status: ${booking.status}
Sync Attempts: ${booking.guestly_sync_attempts}
  `.trim();
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Send alert when Guestly sync fails after all retries
 */
export async function sendSyncFailureAlert(
  booking: BookingData,
  errorMessage: string
): Promise<void> {
  // Check if notifications are enabled
  if (!isNotificationEnabled()) {
    console.log('Admin notifications disabled (no ADMIN_ALERT_EMAIL configured)');
    return;
  }

  const adminEmail = getAdminEmail()!;

  const subject = `[ALERT] Guestly Sync Failed - Booking ${booking.booking_reference}`;

  const textBody = `
GUESTLY SYNC FAILURE ALERT

A booking failed to sync to Guestly after multiple retry attempts.
This requires manual intervention.

ERROR:
${errorMessage}

BOOKING DETAILS:
${formatBookingDetails(booking)}

ACTION REQUIRED:
1. Log into the admin panel
2. Review the booking details
3. Manually create the reservation in Guestly if needed
4. Update the booking sync status

Booking ID: ${booking.id}
Timestamp: ${new Date().toISOString()}
  `.trim();

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .alert { background: #dc3545; color: white; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
    .error-box { background: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 5px; margin: 20px 0; }
    .details { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; }
    .details pre { margin: 0; white-space: pre-wrap; }
    .action { background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 5px; margin: 20px 0; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; font-size: 12px; color: #6c757d; }
  </style>
</head>
<body>
  <div class="container">
    <div class="alert">
      <h2 style="margin: 0;">⚠️ Guestly Sync Failure Alert</h2>
    </div>

    <p>A booking failed to sync to Guestly after multiple retry attempts. This requires manual intervention.</p>

    <div class="error-box">
      <h3>Error Message</h3>
      <p><strong>${errorMessage}</strong></p>
    </div>

    <div class="details">
      <h3>Booking Details</h3>
      <pre>${formatBookingDetails(booking)}</pre>
    </div>

    <div class="action">
      <h3>Action Required</h3>
      <ol>
        <li>Log into the admin panel</li>
        <li>Review the booking details</li>
        <li>Manually create the reservation in Guestly if needed</li>
        <li>Update the booking sync status</li>
      </ol>
    </div>

    <div class="footer">
      <p>
        Booking ID: <code>${booking.id}</code><br>
        Timestamp: ${new Date().toISOString()}
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();

  try {
    const success = await sendEmail(adminEmail, subject, htmlBody, textBody);

    if (success) {
      console.log(`Sent sync failure alert to ${adminEmail} for booking ${booking.booking_reference}`);
    } else {
      console.error(`Failed to send sync failure alert to ${adminEmail}`);
    }

  } catch (error) {
    console.error('Error sending sync failure alert:', error);
    throw error;
  }
}

/**
 * Send alert for any critical booking issue
 */
export async function sendBookingAlert(
  title: string,
  message: string,
  bookingId?: string
): Promise<void> {
  if (!isNotificationEnabled()) {
    console.log('Admin notifications disabled');
    return;
  }

  const adminEmail = getAdminEmail()!;
  const subject = `[ALERT] ${title}`;

  const textBody = `
BOOKING ALERT

${message}

${bookingId ? `Booking ID: ${bookingId}` : ''}
Timestamp: ${new Date().toISOString()}
  `.trim();

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .alert { background: #ffc107; color: #000; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
    .message { padding: 15px; background: #f8f9fa; border-radius: 5px; margin: 20px 0; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; font-size: 12px; color: #6c757d; }
  </style>
</head>
<body>
  <div class="container">
    <div class="alert">
      <h2 style="margin: 0;">⚠️ ${title}</h2>
    </div>

    <div class="message">
      <p>${message.replace(/\n/g, '<br>')}</p>
    </div>

    <div class="footer">
      <p>
        ${bookingId ? `Booking ID: <code>${bookingId}</code><br>` : ''}
        Timestamp: ${new Date().toISOString()}
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();

  try {
    await sendEmail(adminEmail, subject, htmlBody, textBody);
    console.log(`Sent booking alert to ${adminEmail}: ${title}`);
  } catch (error) {
    console.error('Error sending booking alert:', error);
  }
}
