import { z } from 'zod';

// Step 1: Property & Dates Selection
export const step1Schema = z.object({
  propertyId: z.string().min(1, 'Please select a property'),
  checkInDate: z.date({
    message: 'Check-in date is required',
  }),
  checkOutDate: z.date({
    message: 'Check-out date is required',
  }),
  adults: z.number().min(1, 'At least 1 adult required').max(5, 'Maximum 5 adults'),
  children: z.number().min(0).max(3, 'Maximum 3 children'),
  infants: z.number().min(0).max(2, 'Maximum 2 infants'),
  specialRequests: z.object({
    earlyCheckIn: z.boolean().optional().default(false),
    lateCheckout: z.boolean().optional().default(false),
    airportPickup: z.boolean().optional().default(false),
    pet: z.boolean().optional().default(false),
  }),
}).refine(
  (data) => {
    if (!data.checkInDate || !data.checkOutDate) {
      console.log('Validation failed: Missing dates');
      return false;
    }

    // Calculate nights directly here to avoid function call issues
    const msPerDay = 1000 * 60 * 60 * 24;
    const nights = Math.floor((data.checkOutDate.getTime() - data.checkInDate.getTime()) / msPerDay);

    // Check minimum stay
    if (nights < 3) {
      console.log('Validation failed: Not enough nights', { nights });
      return false;
    }

    // Check dates are in future
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (data.checkInDate < today) {
      console.log('Validation failed: Check-in date in the past', {
        checkIn: data.checkInDate.toISOString(),
        today: today.toISOString(),
      });
      return false;
    }

    // Check check-out is after check-in
    if (data.checkOutDate <= data.checkInDate) {
      console.log('Validation failed: Check-out not after check-in');
      return false;
    }

    console.log('Validation passed!', {
      checkIn: data.checkInDate.toISOString(),
      checkOut: data.checkOutDate.toISOString(),
      nights,
    });

    return true;
  },
  {
    message: 'booking.step1.errors.minStay',
    path: ['checkOutDate'],
  }
);

export type Step1Data = z.infer<typeof step1Schema>;

// Step 2: Guest Information
export const step2Schema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  country: z.string().min(1, 'Please select a country'),
  company: z.string().optional(),
  purposeOfStay: z.enum(['business', 'leisure', 'hospital', 'other'], {
    message: 'Please select purpose of stay',
  }),
  specialRequests: z.string().optional(),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the terms and conditions',
  }),
  agreeToPrivacy: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the privacy policy',
  }),
  receiveUpdates: z.boolean().default(false),
});

export type Step2Data = z.infer<typeof step2Schema>;

// Step 3: Pricing (no validation needed, just display)
export const step3Schema = z.object({
  confirmed: z.boolean().default(false),
});

export type Step3Data = z.infer<typeof step3Schema>;

// Step 4: Payment
export const step4Schema = z.object({
  paymentMethod: z.enum(['card', 'sepa']).default('card'),
  cardholderName: z.string().min(2, 'Cardholder name is required'),
  cardNumber: z.string().min(16, 'Please enter a valid card number'),
  expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Format: MM/YY'),
  cvc: z.string().min(3, 'CVC must be 3 digits').max(4, 'CVC must be 3-4 digits'),
  sameAsBilling: z.boolean().default(true),
  billingAddress: z.object({
    address: z.string().optional(),
    city: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
});

export type Step4Data = z.infer<typeof step4Schema>;

// Step 5: Confirmation (no validation needed)
export const step5Schema = z.object({
  bookingReference: z.string(),
  confirmed: z.boolean().default(true),
});

export type Step5Data = z.infer<typeof step5Schema>;

// Complete booking data
export const completeBookingSchema = z.object({
  step1: step1Schema,
  step2: step2Schema,
  step3: step3Schema,
  step4: step4Schema,
});

export type CompleteBookingData = z.infer<typeof completeBookingSchema>;
