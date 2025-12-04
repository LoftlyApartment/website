export type Locale = 'de' | 'en';

export interface Property {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  country: string;
  price_per_night: number;
  bedrooms: number;
  bathrooms: number;
  max_guests: number;
  amenities: string[];
  images: PropertyImage[];
  lodgify_id?: string;
  created_at: string;
  updated_at: string;
}

export interface PropertyImage {
  id: string;
  property_id: string;
  url: string;
  alt_text: string;
  order: number;
}

export interface Booking {
  id: string;
  property_id: string;
  user_id: string;
  check_in: string;
  check_out: string;
  guests: number;
  total_price: number;
  status: BookingStatus;
  stripe_payment_intent_id?: string;
  special_requests?: string;
  created_at: string;
  updated_at: string;
}

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  language: Locale;
  created_at: string;
  updated_at: string;
}

export interface BookingFormData {
  property_id: string;
  check_in: Date;
  check_out: Date;
  guests: number;
  special_requests?: string;
}

export interface PriceCalculation {
  base_price: number;
  cleaning_fee: number;
  service_fee: number;
  tax: number;
  total: number;
  nights: number;
}

export interface LodgifyProperty {
  id: number;
  name: string;
  description: string;
  address: {
    street: string;
    city: string;
    country: string;
  };
  rooms: {
    bedrooms: number;
    bathrooms: number;
  };
  max_guests: number;
  amenities: string[];
  images: Array<{
    url: string;
    caption: string;
  }>;
}

export interface LodgifyAvailability {
  property_id: number;
  date: string;
  available: boolean;
  price: number;
  minimum_stay: number;
}

export interface StripePaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  client_secret: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
  success: boolean;
}
