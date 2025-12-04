-- Add helper function for incrementing Guestly sync attempts
-- Created: 2025-11-19

-- Function to safely increment sync attempts counter
CREATE OR REPLACE FUNCTION increment_sync_attempts(booking_id UUID)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE bookings
  SET guestly_sync_attempts = COALESCE(guestly_sync_attempts, 0) + 1
  WHERE id = booking_id;
END;
$$;

-- Add comment
COMMENT ON FUNCTION increment_sync_attempts IS 'Safely increment the Guestly sync attempts counter for a booking';
