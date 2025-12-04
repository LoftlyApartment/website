/**
 * Database Function Types
 * Type definitions for Supabase RPC functions
 */

export interface BookingPriceCalculation {
  nights: number;
  base_price: number;
  discount: number;
  cleaning_fee: number;
  pet_fee: number;
  subtotal: number;
  vat: number;
  total: number;
}

export interface UnavailableDate {
  unavailable_date: string;
}

// RPC function parameter types
export type CheckAvailabilityParams = {
  p_property_id: string;
  p_check_in: string;
  p_check_out: string;
  p_booking_id?: string | null;
};

export type CalculatePriceParams = {
  p_property_id: string;
  p_check_in: string;
  p_check_out: string;
  p_has_pet?: boolean;
};

export type GetUnavailableDatesParams = {
  p_property_id: string;
  p_start_date: string;
  p_end_date: string;
};
