-- Add Guestly synchronization tracking fields to bookings table
-- Created: 2025-11-19
-- Purpose: Track booking sync status with Guestly property management system

-- Add Guestly sync tracking columns
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS guestly_reservation_id TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS guestly_sync_status TEXT DEFAULT 'pending' CHECK (guestly_sync_status IN ('pending', 'synced', 'failed'));
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS guestly_sync_error TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS guestly_synced_at TIMESTAMPTZ;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS guestly_sync_attempts INTEGER DEFAULT 0;

-- Add comments for documentation
COMMENT ON COLUMN bookings.guestly_reservation_id IS 'Guestly reservation ID after successful sync';
COMMENT ON COLUMN bookings.guestly_sync_status IS 'Current sync status: pending (not synced yet), synced (successfully synced), failed (sync failed after retries)';
COMMENT ON COLUMN bookings.guestly_sync_error IS 'Error message if sync failed';
COMMENT ON COLUMN bookings.guestly_synced_at IS 'Timestamp when booking was successfully synced to Guestly';
COMMENT ON COLUMN bookings.guestly_sync_attempts IS 'Number of sync attempts (for retry tracking)';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_bookings_guestly_reservation_id ON bookings(guestly_reservation_id);
CREATE INDEX IF NOT EXISTS idx_bookings_guestly_sync_status ON bookings(guestly_sync_status);

-- Create index for finding failed syncs that need retry
CREATE INDEX IF NOT EXISTS idx_bookings_failed_syncs ON bookings(guestly_sync_status, guestly_sync_attempts)
  WHERE guestly_sync_status = 'failed';
