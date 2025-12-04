-- Add webhook logging and source tracking
-- Created: 2025-11-19
-- Purpose: Track webhook events from Guestly and distinguish booking sources

-- Create webhook_logs table for audit trail
CREATE TABLE IF NOT EXISTS webhook_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id TEXT,
  event_type TEXT NOT NULL,
  source TEXT DEFAULT 'guestly' CHECK (source IN ('guestly', 'stripe', 'other')),
  payload JSONB NOT NULL,
  status TEXT DEFAULT 'received' CHECK (status IN ('received', 'processing', 'success', 'failed')),
  error TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add source tracking to bookings table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS booking_source TEXT DEFAULT 'website' CHECK (booking_source IN ('website', 'guestly', 'manual'));

-- Add comments for documentation
COMMENT ON TABLE webhook_logs IS 'Audit log of all webhook events received from external services';
COMMENT ON COLUMN webhook_logs.event_id IS 'Unique event ID from the webhook source';
COMMENT ON COLUMN webhook_logs.event_type IS 'Type of event (e.g., reservation.created, reservation.updated)';
COMMENT ON COLUMN webhook_logs.source IS 'Source system that sent the webhook';
COMMENT ON COLUMN webhook_logs.payload IS 'Full JSON payload of the webhook event';
COMMENT ON COLUMN webhook_logs.status IS 'Processing status of the webhook';
COMMENT ON COLUMN webhook_logs.error IS 'Error message if processing failed';
COMMENT ON COLUMN webhook_logs.processed_at IS 'Timestamp when webhook was successfully processed';

COMMENT ON COLUMN bookings.booking_source IS 'Origin of the booking: website (direct booking), guestly (imported from Guestly), manual (admin created)';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_webhook_logs_event_id ON webhook_logs(event_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_event_type ON webhook_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_status ON webhook_logs(status);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_created_at ON webhook_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_source ON webhook_logs(source);

-- Index for finding failed webhooks that need retry
CREATE INDEX IF NOT EXISTS idx_webhook_logs_failed ON webhook_logs(status, created_at)
  WHERE status = 'failed';

-- Index for booking source filtering
CREATE INDEX IF NOT EXISTS idx_bookings_source ON bookings(booking_source);

-- Create composite index for finding Guestly bookings
CREATE INDEX IF NOT EXISTS idx_bookings_guestly_source ON bookings(booking_source, guestly_reservation_id)
  WHERE booking_source = 'guestly';
