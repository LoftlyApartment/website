-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_profiles_updated_at
  BEFORE UPDATE ON admin_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to generate booking reference
CREATE OR REPLACE FUNCTION generate_booking_reference()
RETURNS TEXT AS $$
DECLARE
  ref TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    ref := 'LA' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(FLOOR(RANDOM() * 99999)::TEXT, 5, '0');
    SELECT EXISTS(SELECT 1 FROM bookings WHERE booking_reference = ref) INTO exists;
    EXIT WHEN NOT exists;
  END LOOP;
  RETURN ref;
END;
$$ LANGUAGE plpgsql;

-- Function to check booking availability
CREATE OR REPLACE FUNCTION check_booking_availability(
  p_property_id UUID,
  p_check_in DATE,
  p_check_out DATE,
  p_booking_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  conflict_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO conflict_count
  FROM bookings
  WHERE property_id = p_property_id
    AND status NOT IN ('cancelled')
    AND (
      -- New booking overlaps with existing booking
      (check_in_date, check_out_date) OVERLAPS (p_check_in, p_check_out)
    )
    -- Exclude current booking if updating
    AND (p_booking_id IS NULL OR id != p_booking_id);

  RETURN conflict_count = 0;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate booking price
CREATE OR REPLACE FUNCTION calculate_booking_price(
  p_property_id UUID,
  p_check_in DATE,
  p_check_out DATE,
  p_has_pet BOOLEAN DEFAULT FALSE
)
RETURNS TABLE(
  nights INTEGER,
  base_price DECIMAL(10,2),
  discount DECIMAL(10,2),
  cleaning_fee DECIMAL(10,2),
  pet_fee DECIMAL(10,2),
  subtotal DECIMAL(10,2),
  vat DECIMAL(10,2),
  total DECIMAL(10,2)
) AS $$
DECLARE
  v_nights INTEGER;
  v_base_price DECIMAL(10,2);
  v_discount_percent INTEGER;
  v_discount DECIMAL(10,2);
  v_cleaning_fee DECIMAL(10,2);
  v_pet_fee DECIMAL(10,2);
  v_subtotal DECIMAL(10,2);
  v_vat DECIMAL(10,2);
  v_total DECIMAL(10,2);
  v_nightly_rate DECIMAL(10,2);
  v_weekly_discount INTEGER;
  v_monthly_discount INTEGER;
BEGIN
  -- Get property details
  SELECT
    p.base_price,
    p.cleaning_fee,
    CASE WHEN p_has_pet THEN p.pet_fee ELSE 0 END,
    p.weekly_discount,
    p.monthly_discount
  INTO
    v_nightly_rate,
    v_cleaning_fee,
    v_pet_fee,
    v_weekly_discount,
    v_monthly_discount
  FROM properties p
  WHERE p.id = p_property_id;

  -- Calculate nights
  v_nights := p_check_out - p_check_in;

  -- Calculate base price
  v_base_price := v_nightly_rate * v_nights;

  -- Calculate discount based on length of stay
  v_discount_percent := 0;
  IF v_nights >= 28 THEN
    v_discount_percent := v_monthly_discount;
  ELSIF v_nights >= 7 THEN
    v_discount_percent := v_weekly_discount;
  END IF;

  v_discount := ROUND(v_base_price * v_discount_percent / 100, 2);

  -- Calculate subtotal
  v_subtotal := v_base_price - v_discount + v_cleaning_fee + v_pet_fee;

  -- Calculate VAT (19% in Germany)
  v_vat := ROUND(v_subtotal * 0.19, 2);

  -- Calculate total
  v_total := v_subtotal + v_vat;

  -- Return calculated values
  RETURN QUERY SELECT
    v_nights,
    v_base_price,
    v_discount,
    v_cleaning_fee,
    v_pet_fee,
    v_subtotal,
    v_vat,
    v_total;
END;
$$ LANGUAGE plpgsql;

-- Function to get available dates for a property
CREATE OR REPLACE FUNCTION get_unavailable_dates(
  p_property_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE(
  unavailable_date DATE
) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT date_series.date::DATE
  FROM bookings b
  CROSS JOIN LATERAL generate_series(
    b.check_in_date,
    b.check_out_date - INTERVAL '1 day',
    INTERVAL '1 day'
  ) AS date_series(date)
  WHERE b.property_id = p_property_id
    AND b.status NOT IN ('cancelled')
    AND date_series.date::DATE BETWEEN p_start_date AND p_end_date;
END;
$$ LANGUAGE plpgsql;
