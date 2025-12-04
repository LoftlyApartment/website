/**
 * Database Helper Functions
 * Reusable database operations for the booking system
 */

import type { Database } from '@/types/database';
import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  BookingPriceCalculation,
  UnavailableDate,
  CheckAvailabilityParams,
  CalculatePriceParams,
  GetUnavailableDatesParams,
} from '@/types/database-functions';

type DbClient = SupabaseClient<Database>;

/**
 * Generate a unique booking reference
 */
export async function generateBookingReference(
  supabase: DbClient
): Promise<string> {
  const { data, error } = await supabase.rpc('generate_booking_reference');

  if (error) throw error;
  return data;
}

/**
 * Check if a property is available for booking
 */
export async function checkAvailability(
  supabase: DbClient,
  propertyId: string,
  checkIn: string,
  checkOut: string,
  bookingId?: string
): Promise<boolean> {
  const params: CheckAvailabilityParams = {
    p_property_id: propertyId,
    p_check_in: checkIn,
    p_check_out: checkOut,
    p_booking_id: bookingId || null,
  };

  const { data, error } = await supabase.rpc(
    'check_booking_availability',
    params as any
  );

  if (error) throw error;
  return data as boolean;
}

/**
 * Calculate booking price with all fees and discounts
 */
export async function calculatePrice(
  supabase: DbClient,
  propertyId: string,
  checkIn: string,
  checkOut: string,
  hasPet: boolean = false
): Promise<BookingPriceCalculation> {
  const params: CalculatePriceParams = {
    p_property_id: propertyId,
    p_check_in: checkIn,
    p_check_out: checkOut,
    p_has_pet: hasPet,
  };

  const { data, error } = await supabase.rpc(
    'calculate_booking_price',
    params as any
  );

  if (error) throw error;
  const result = data as any;
  return result[0] as BookingPriceCalculation;
}

/**
 * Get unavailable dates for a property
 */
export async function getUnavailableDates(
  supabase: DbClient,
  propertyId: string,
  startDate: string,
  endDate: string
): Promise<string[]> {
  const params: GetUnavailableDatesParams = {
    p_property_id: propertyId,
    p_start_date: startDate,
    p_end_date: endDate,
  };

  const { data, error } = await supabase.rpc(
    'get_unavailable_dates',
    params as any
  );

  if (error) throw error;
  const result = data as any;
  return result.map((row: UnavailableDate) => row.unavailable_date);
}

/**
 * Get all active properties
 */
export async function getActiveProperties(supabase: DbClient) {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (error) throw error;
  return data;
}

/**
 * Get a single property by slug
 */
export async function getPropertyBySlug(
  supabase: DbClient,
  slug: string
) {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get a booking by reference
 */
export async function getBookingByReference(
  supabase: DbClient,
  reference: string
) {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, properties(*)')
    .eq('booking_reference', reference)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get bookings for a property in a date range
 */
export async function getPropertyBookings(
  supabase: DbClient,
  propertyId: string,
  startDate?: string,
  endDate?: string
) {
  let query = supabase
    .from('bookings')
    .select('*')
    .eq('property_id', propertyId)
    .neq('status', 'cancelled')
    .order('check_in_date');

  if (startDate) {
    query = query.gte('check_out_date', startDate);
  }

  if (endDate) {
    query = query.lte('check_in_date', endDate);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
}

/**
 * Create a new booking
 */
export async function createBooking(
  supabase: DbClient,
  bookingData: Database['public']['Tables']['bookings']['Insert']
) {
  const { data, error } = await supabase
    .from('bookings')
    .insert(bookingData as any)
    .select()
    .single();

  if (error) throw error;
  return data as Database['public']['Tables']['bookings']['Row'];
}

/**
 * Update booking status
 */
export async function updateBookingStatus(
  supabase: DbClient,
  bookingId: string,
  status: Database['public']['Tables']['bookings']['Row']['status'],
  additionalData?: Partial<Database['public']['Tables']['bookings']['Update']>
) {
  const updateData: Database['public']['Tables']['bookings']['Update'] = {
    status,
    ...additionalData,
  };

  // Set timestamp based on status
  if (status === 'confirmed') {
    updateData.confirmed_at = new Date().toISOString();
  } else if (status === 'cancelled') {
    updateData.cancelled_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('bookings')
    // @ts-ignore - Supabase type issue with update
    .update(updateData as any)
    .eq('id', bookingId)
    .select()
    .single();

  if (error) throw error;
  return data as Database['public']['Tables']['bookings']['Row'];
}

/**
 * Update booking payment status
 */
export async function updateBookingPayment(
  supabase: DbClient,
  bookingId: string,
  paymentStatus: Database['public']['Tables']['bookings']['Row']['payment_status'],
  paymentData?: {
    payment_method?: string;
    stripe_payment_intent_id?: string;
    stripe_charge_id?: string;
  }
) {
  const { data, error } = await supabase
    .from('bookings')
    // @ts-ignore - Supabase type issue with update
    .update({
      payment_status: paymentStatus,
      ...paymentData,
    } as any)
    .eq('id', bookingId)
    .select()
    .single();

  if (error) throw error;
  return data as Database['public']['Tables']['bookings']['Row'];
}

/**
 * Get bookings by guest email
 */
export async function getGuestBookings(
  supabase: DbClient,
  email: string
) {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, properties(*)')
    .eq('guest_email', email)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Add a note to a booking (admin only)
 */
export async function addBookingNote(
  supabase: DbClient,
  bookingId: string,
  note: string,
  adminId?: string
) {
  const { data, error } = await supabase
    .from('booking_notes')
    .insert({
      booking_id: bookingId,
      admin_id: adminId || null,
      note,
    } as any)
    .select()
    .single();

  if (error) throw error;
  return data as Database['public']['Tables']['booking_notes']['Row'];
}

/**
 * Get notes for a booking (admin only)
 */
export async function getBookingNotes(
  supabase: DbClient,
  bookingId: string
) {
  const { data, error } = await supabase
    .from('booking_notes')
    .select('*, admin_profiles(*)')
    .eq('booking_id', bookingId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Check if user is an active admin
 */
export async function isActiveAdmin(
  supabase: DbClient,
  userId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('admin_profiles')
    .select('is_active')
    .eq('id', userId)
    .single();

  if (error) return false;
  const result = data as any;
  return result?.is_active || false;
}

/**
 * Get upcoming bookings (for admin dashboard)
 */
export async function getUpcomingBookings(
  supabase: DbClient,
  limit: number = 10
) {
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('bookings')
    .select('*, properties(*)')
    .gte('check_in_date', today)
    .neq('status', 'cancelled')
    .order('check_in_date')
    .limit(limit);

  if (error) throw error;
  return data;
}

/**
 * Get booking statistics (for admin dashboard)
 */
export async function getBookingStats(
  supabase: DbClient,
  startDate?: string,
  endDate?: string
) {
  let query = supabase
    .from('bookings')
    .select('status, payment_status, total');

  if (startDate) {
    query = query.gte('created_at', startDate);
  }

  if (endDate) {
    query = query.lte('created_at', endDate);
  }

  const { data, error } = await query;

  if (error) throw error;

  // Calculate statistics
  const bookings = data as any[];
  const stats = {
    total: bookings.length,
    confirmed: bookings.filter((b) => b.status === 'confirmed').length,
    pending: bookings.filter((b) => b.status === 'pending').length,
    cancelled: bookings.filter((b) => b.status === 'cancelled').length,
    completed: bookings.filter((b) => b.status === 'completed').length,
    revenue: bookings
      .filter((b) => b.payment_status === 'completed')
      .reduce((sum, b) => sum + Number(b.total || 0), 0),
  };

  return stats;
}
