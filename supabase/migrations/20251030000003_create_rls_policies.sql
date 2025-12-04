-- Enable RLS on all tables
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_notes ENABLE ROW LEVEL SECURITY;

-- Properties policies (public read, admin write)
CREATE POLICY "Properties are viewable by everyone"
  ON properties
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can insert properties"
  ON properties
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_profiles
      WHERE admin_profiles.id = auth.uid()
        AND admin_profiles.is_active = true
    )
  );

CREATE POLICY "Admins can update properties"
  ON properties
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles
      WHERE admin_profiles.id = auth.uid()
        AND admin_profiles.is_active = true
    )
  );

CREATE POLICY "Admins can delete properties"
  ON properties
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles
      WHERE admin_profiles.id = auth.uid()
        AND admin_profiles.is_active = true
    )
  );

-- Bookings policies
CREATE POLICY "Anyone can create bookings"
  ON bookings
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view their own bookings"
  ON bookings
  FOR SELECT
  USING (
    -- Guest can view their own booking by email
    guest_email = auth.jwt() ->> 'email'
    OR
    -- Admins can view all bookings
    EXISTS (
      SELECT 1 FROM admin_profiles
      WHERE admin_profiles.id = auth.uid()
        AND admin_profiles.is_active = true
    )
  );

CREATE POLICY "Admins can update bookings"
  ON bookings
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles
      WHERE admin_profiles.id = auth.uid()
        AND admin_profiles.is_active = true
    )
  );

CREATE POLICY "Admins can delete bookings"
  ON bookings
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles
      WHERE admin_profiles.id = auth.uid()
        AND admin_profiles.is_active = true
    )
  );

-- Admin profiles policies
CREATE POLICY "Admins can view admin profiles"
  ON admin_profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles ap
      WHERE ap.id = auth.uid()
        AND ap.is_active = true
    )
  );

CREATE POLICY "Admins can insert admin profiles"
  ON admin_profiles
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_profiles
      WHERE admin_profiles.id = auth.uid()
        AND admin_profiles.is_active = true
        AND admin_profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update admin profiles"
  ON admin_profiles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles
      WHERE admin_profiles.id = auth.uid()
        AND admin_profiles.is_active = true
        AND admin_profiles.role = 'admin'
    )
  );

-- Booking notes policies
CREATE POLICY "Admins can view booking notes"
  ON booking_notes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles
      WHERE admin_profiles.id = auth.uid()
        AND admin_profiles.is_active = true
    )
  );

CREATE POLICY "Admins can insert booking notes"
  ON booking_notes
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_profiles
      WHERE admin_profiles.id = auth.uid()
        AND admin_profiles.is_active = true
    )
  );

CREATE POLICY "Admins can update booking notes"
  ON booking_notes
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles
      WHERE admin_profiles.id = auth.uid()
        AND admin_profiles.is_active = true
    )
  );

CREATE POLICY "Admins can delete booking notes"
  ON booking_notes
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles
      WHERE admin_profiles.id = auth.uid()
        AND admin_profiles.is_active = true
    )
  );
