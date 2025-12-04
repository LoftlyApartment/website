export const APP_NAME = 'Loftly Apartment GmbH';

export const DEFAULT_LOCALE = 'de';
export const SUPPORTED_LOCALES = ['de', 'en'] as const;

export const CURRENCY = 'EUR';
export const CURRENCY_SYMBOL = '€';

export const DATE_FORMAT = 'dd.MM.yyyy';
export const DATE_TIME_FORMAT = 'dd.MM.yyyy HH:mm';

export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
} as const;

export const AMENITIES = {
  WIFI: 'wifi',
  PARKING: 'parking',
  KITCHEN: 'kitchen',
  WASHING_MACHINE: 'washing_machine',
  AIR_CONDITIONING: 'air_conditioning',
  HEATING: 'heating',
  TV: 'tv',
  BALCONY: 'balcony',
  ELEVATOR: 'elevator',
  PETS_ALLOWED: 'pets_allowed',
} as const;

export const ROUTES = {
  HOME: '/',
  PROPERTIES: '/properties',
  PROPERTY_DETAIL: (id: string) => `/properties/${id}`,
  BOOKING: '/booking',
  ABOUT: '/about',
  CONTACT: '/contact',
  FAQ: '/faq',
  BLOG: '/blog',
  LEGAL: '/legal',
  PRIVACY: '/legal/privacy',
  TERMS: '/legal/terms',
  IMPRINT: '/legal/imprint',
  ADMIN: '/admin',
  ADMIN_BOOKINGS: '/admin/bookings',
  ADMIN_PROPERTIES: '/admin/properties',
} as const;

export const API_ROUTES = {
  PROPERTIES: '/api/properties',
  PROPERTY_DETAIL: (id: string) => `/api/properties/${id}`,
  BOOKINGS: '/api/bookings',
  BOOKING_DETAIL: (id: string) => `/api/bookings/${id}`,
  AVAILABILITY: '/api/availability',
  PAYMENT_INTENT: '/api/payment/create-intent',
  WEBHOOK_STRIPE: '/api/webhooks/stripe',
} as const;

export const VALIDATION = {
  MIN_STAY_NIGHTS: 1,
  MAX_STAY_NIGHTS: 90,
  MIN_GUESTS: 1,
  MAX_GUESTS: 10,
  BOOKING_ADVANCE_DAYS: 1,
  BOOKING_MAX_ADVANCE_DAYS: 365,
} as const;

export const FEES = {
  CLEANING_FEE_PERCENTAGE: 0.1,
  SERVICE_FEE_PERCENTAGE: 0.15,
  TAX_PERCENTAGE: 0.19,
} as const;
