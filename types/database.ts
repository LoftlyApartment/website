/**
 * Database Types
 * Auto-generated types for Supabase database schema
 */

// Existing Enums (Profiles & Subscriptions)
export type MembershipTier = 'free' | 'pro' | 'enterprise';

export type SubscriptionStatus =
  | 'active'
  | 'canceled'
  | 'past_due'
  | 'trialing'
  | 'incomplete'
  | 'incomplete_expired'
  | 'unpaid';

// Booking System Enums
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export type AdminRole = 'admin' | 'manager' | 'staff';
export type GuestlySyncStatus = 'pending' | 'synced' | 'failed';
export type BookingSource = 'website' | 'guestly' | 'manual';

// Table: profiles
export interface Profile {
  id: string; // UUID - references auth.users(id)
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  membership_tier: MembershipTier;
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

export interface ProfileInsert {
  id: string;
  email: string;
  full_name?: string | null;
  avatar_url?: string | null;
  membership_tier?: MembershipTier;
}

export interface ProfileUpdate {
  email?: string;
  full_name?: string | null;
  avatar_url?: string | null;
  membership_tier?: MembershipTier;
}

// Table: subscriptions
export interface Subscription {
  id: string; // UUID
  user_id: string; // UUID - references profiles(id)

  // Stripe identifiers
  stripe_customer_id: string;
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
  stripe_product_id: string | null;

  // Subscription details
  status: SubscriptionStatus;
  membership_tier: MembershipTier;

  // Billing period
  current_period_start: string | null; // ISO timestamp
  current_period_end: string | null; // ISO timestamp
  cancel_at_period_end: boolean;
  canceled_at: string | null; // ISO timestamp

  // Trial information
  trial_start: string | null; // ISO timestamp
  trial_end: string | null; // ISO timestamp

  // Timestamps
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

export interface SubscriptionInsert {
  user_id: string;
  stripe_customer_id: string;
  stripe_subscription_id?: string | null;
  stripe_price_id?: string | null;
  stripe_product_id?: string | null;
  status: SubscriptionStatus;
  membership_tier: MembershipTier;
  current_period_start?: string | null;
  current_period_end?: string | null;
  cancel_at_period_end?: boolean;
  canceled_at?: string | null;
  trial_start?: string | null;
  trial_end?: string | null;
}

export interface SubscriptionUpdate {
  stripe_subscription_id?: string | null;
  stripe_price_id?: string | null;
  stripe_product_id?: string | null;
  status?: SubscriptionStatus;
  membership_tier?: MembershipTier;
  current_period_start?: string | null;
  current_period_end?: string | null;
  cancel_at_period_end?: boolean;
  canceled_at?: string | null;
  trial_start?: string | null;
  trial_end?: string | null;
}

// Table: properties
export interface Property {
  id: string;
  slug: string;
  name: string;
  address: string;
  size: number;
  bedrooms: number;
  bathrooms: number;
  max_guests: number;
  base_price: number;
  cleaning_fee: number;
  pet_fee: number;
  weekly_discount: number;
  monthly_discount: number;
  min_stay: number;
  pet_friendly: boolean;
  amenities: string[];
  images: string[];
  coordinates: { lat: number; lng: number } | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PropertyInsert {
  slug: string;
  name: string;
  address: string;
  size: number;
  bedrooms: number;
  bathrooms: number;
  max_guests: number;
  base_price: number;
  cleaning_fee: number;
  pet_fee?: number;
  weekly_discount?: number;
  monthly_discount?: number;
  min_stay?: number;
  pet_friendly?: boolean;
  amenities?: string[];
  images?: string[];
  coordinates?: { lat: number; lng: number } | null;
  is_active?: boolean;
}

export interface PropertyUpdate {
  slug?: string;
  name?: string;
  address?: string;
  size?: number;
  bedrooms?: number;
  bathrooms?: number;
  max_guests?: number;
  base_price?: number;
  cleaning_fee?: number;
  pet_fee?: number;
  weekly_discount?: number;
  monthly_discount?: number;
  min_stay?: number;
  pet_friendly?: boolean;
  amenities?: string[];
  images?: string[];
  coordinates?: { lat: number; lng: number } | null;
  is_active?: boolean;
}

// Table: bookings
export interface Booking {
  id: string;
  booking_reference: string;
  property_id: string;

  // Guest information
  guest_first_name: string;
  guest_last_name: string;
  guest_email: string;
  guest_phone: string;
  guest_country: string;
  guest_company: string | null;

  // Booking details
  check_in_date: string;
  check_out_date: string;
  adults: number;
  children: number;
  infants: number;

  // Pricing
  nights: number;
  base_price: number;
  discount: number;
  cleaning_fee: number;
  pet_fee: number;
  subtotal: number;
  vat: number;
  total: number;

  // Special requests
  special_requests: string | null;
  purpose_of_stay: string | null;
  has_pet: boolean;
  early_checkin: boolean;
  late_checkout: boolean;

  // Payment
  payment_status: PaymentStatus;
  payment_method: string | null;
  stripe_payment_intent_id: string | null;
  stripe_charge_id: string | null;

  // Booking status
  status: BookingStatus;

  // GDPR consent
  terms_accepted: boolean;
  privacy_accepted: boolean;
  marketing_consent: boolean;

  // Guestly integration fields
  guestly_reservation_id: string | null;
  guestly_sync_status: GuestlySyncStatus | null;
  guestly_sync_error: string | null;
  guestly_synced_at: string | null;
  guestly_sync_attempts: number | null;
  booking_source: BookingSource;

  // Timestamps
  created_at: string;
  updated_at: string;
  confirmed_at: string | null;
  cancelled_at: string | null;
}

export interface BookingInsert {
  booking_reference: string;
  property_id: string;
  guest_first_name: string;
  guest_last_name: string;
  guest_email: string;
  guest_phone: string;
  guest_country: string;
  guest_company?: string | null;
  check_in_date: string;
  check_out_date: string;
  adults: number;
  children?: number;
  infants?: number;
  nights: number;
  base_price: number;
  discount?: number;
  cleaning_fee: number;
  pet_fee?: number;
  subtotal: number;
  vat: number;
  total: number;
  special_requests?: string | null;
  purpose_of_stay?: string | null;
  has_pet?: boolean;
  early_checkin?: boolean;
  late_checkout?: boolean;
  payment_status?: PaymentStatus;
  payment_method?: string | null;
  stripe_payment_intent_id?: string | null;
  stripe_charge_id?: string | null;
  status?: BookingStatus;
  terms_accepted?: boolean;
  privacy_accepted?: boolean;
  marketing_consent?: boolean;
  guestly_reservation_id?: string | null;
  guestly_sync_status?: GuestlySyncStatus | null;
  guestly_sync_error?: string | null;
  guestly_synced_at?: string | null;
  guestly_sync_attempts?: number | null;
  booking_source?: BookingSource;
}

export interface BookingUpdate {
  property_id?: string;
  guest_first_name?: string;
  guest_last_name?: string;
  guest_email?: string;
  guest_phone?: string;
  guest_country?: string;
  guest_company?: string | null;
  check_in_date?: string;
  check_out_date?: string;
  adults?: number;
  children?: number;
  infants?: number;
  nights?: number;
  base_price?: number;
  discount?: number;
  cleaning_fee?: number;
  pet_fee?: number;
  subtotal?: number;
  vat?: number;
  total?: number;
  special_requests?: string | null;
  purpose_of_stay?: string | null;
  has_pet?: boolean;
  early_checkin?: boolean;
  late_checkout?: boolean;
  payment_status?: PaymentStatus;
  payment_method?: string | null;
  stripe_payment_intent_id?: string | null;
  stripe_charge_id?: string | null;
  status?: BookingStatus;
  terms_accepted?: boolean;
  privacy_accepted?: boolean;
  marketing_consent?: boolean;
  guestly_reservation_id?: string | null;
  guestly_sync_status?: GuestlySyncStatus | null;
  guestly_sync_error?: string | null;
  guestly_synced_at?: string | null;
  guestly_sync_attempts?: number | null;
  booking_source?: BookingSource;
  confirmed_at?: string | null;
  cancelled_at?: string | null;
}

// Table: admin_profiles
export interface AdminProfile {
  id: string; // UUID - references auth.users(id)
  full_name: string | null;
  role: AdminRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminProfileInsert {
  id: string;
  full_name?: string | null;
  role?: AdminRole;
  is_active?: boolean;
}

export interface AdminProfileUpdate {
  full_name?: string | null;
  role?: AdminRole;
  is_active?: boolean;
}

// Table: booking_notes
export interface BookingNote {
  id: string;
  booking_id: string;
  admin_id: string | null;
  note: string;
  created_at: string;
}

export interface BookingNoteInsert {
  booking_id: string;
  admin_id?: string | null;
  note: string;
}

export interface BookingNoteUpdate {
  note?: string;
}

// Database schema type for Supabase client
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
      };
      subscriptions: {
        Row: Subscription;
        Insert: SubscriptionInsert;
        Update: SubscriptionUpdate;
      };
      properties: {
        Row: Property;
        Insert: PropertyInsert;
        Update: PropertyUpdate;
      };
      bookings: {
        Row: Booking;
        Insert: BookingInsert;
        Update: BookingUpdate;
      };
      admin_profiles: {
        Row: AdminProfile;
        Insert: AdminProfileInsert;
        Update: AdminProfileUpdate;
      };
      booking_notes: {
        Row: BookingNote;
        Insert: BookingNoteInsert;
        Update: BookingNoteUpdate;
      };
    };
    Enums: {
      membership_tier: MembershipTier;
      subscription_status: SubscriptionStatus;
      payment_status: PaymentStatus;
      booking_status: BookingStatus;
      admin_role: AdminRole;
      guestly_sync_status: GuestlySyncStatus;
      booking_source: BookingSource;
    };
    Functions: {
      increment_sync_attempts: {
        Args: { booking_id: string };
        Returns: void;
      };
    };
  };
}
