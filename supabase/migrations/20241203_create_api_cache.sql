-- API Cache Tables for Guesty Integration
-- Prevents rate limiting by caching OAuth tokens, availability, and pricing data

-- 1. OAuth Token Cache
CREATE TABLE IF NOT EXISTS oauth_token_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  provider TEXT NOT NULL DEFAULT 'guesty',
  access_token TEXT NOT NULL,
  token_type TEXT DEFAULT 'Bearer',
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(provider)
);

-- 2. Availability Cache (blocked dates per property)
CREATE TABLE IF NOT EXISTS availability_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  blocked_dates JSONB NOT NULL DEFAULT '[]',
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(property_id, start_date, end_date)
);

-- 3. Pricing Cache
CREATE TABLE IF NOT EXISTS pricing_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id TEXT NOT NULL,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  guests INTEGER DEFAULT 2,
  pricing_data JSONB NOT NULL,
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(property_id, check_in, check_out, guests)
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_availability_cache_property ON availability_cache(property_id);
CREATE INDEX IF NOT EXISTS idx_availability_cache_expires ON availability_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_pricing_cache_property ON pricing_cache(property_id);
CREATE INDEX IF NOT EXISTS idx_pricing_cache_expires ON pricing_cache(expires_at);

-- Enable Row Level Security
ALTER TABLE oauth_token_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_cache ENABLE ROW LEVEL SECURITY;

-- Policies for service role access (server-side only)
CREATE POLICY "Service role can manage oauth_token_cache" ON oauth_token_cache
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role can manage availability_cache" ON availability_cache
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role can manage pricing_cache" ON pricing_cache
  FOR ALL USING (true) WITH CHECK (true);

-- Function to clean up expired cache entries (run periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM availability_cache WHERE expires_at < NOW();
  DELETE FROM pricing_cache WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;
