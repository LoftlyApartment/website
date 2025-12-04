-- Add Kottbusser Damm property (was missing from initial seed)
-- Run this on production Supabase to fix "Property not found" error in bookings

INSERT INTO properties (
  slug,
  name,
  address,
  size,
  bedrooms,
  bathrooms,
  max_guests,
  base_price,
  cleaning_fee,
  pet_fee,
  weekly_discount,
  monthly_discount,
  min_stay,
  pet_friendly,
  amenities,
  images,
  coordinates,
  is_active
) VALUES
(
  'kottbusserdamm',
  'Kottbusser Damm Apartment',
  'Kottbusser Damm 68, 10967 Berlin',
  55,
  2,
  1,
  7,
  140.00,
  60.00,
  25.00,
  10,
  20,
  3,
  true,
  '["wifi", "pet_friendly", "kitchen", "washer", "dryer", "tv", "heating", "smoke_detector", "first_aid", "parking", "garden", "dishwasher", "ev_charger", "public_transport"]'::jsonb,
  '[]'::jsonb,
  '{"lat": 52.4922, "lng": 13.4197}'::jsonb,
  true
)
ON CONFLICT (slug) DO NOTHING;
