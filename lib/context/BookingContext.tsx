'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { Step1Data, Step2Data, Step4Data } from '../validation/booking';
import { PricingBreakdown, fetchGuestlyPricing, calculateTotalPrice } from '../utils/booking';

interface BookingState {
  // Current step (1-5)
  currentStep: number;

  // Step 1 data
  step1: Partial<Step1Data>;

  // Step 2 data
  step2: Partial<Step2Data>;

  // Step 3 data (pricing)
  pricing: PricingBreakdown | null;
  pricingLoading: boolean;

  // Step 4 data
  step4: Partial<Step4Data>;

  // Step 5 data
  bookingReference: string | null;
}

interface BookingContextType {
  state: BookingState;
  updateStep1: (data: Partial<Step1Data>) => void;
  updateStep2: (data: Partial<Step2Data>) => void;
  updateStep4: (data: Partial<Step4Data>) => void;
  setBookingReference: (ref: string) => void;
  calculatePricing: () => void;
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (step: number) => void;
  resetBooking: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

const INITIAL_STATE: BookingState = {
  currentStep: 1,
  step1: {
    propertyId: '',
    adults: 1,
    children: 0,
    infants: 0,
    specialRequests: {
      earlyCheckIn: false,
      lateCheckout: false,
      airportPickup: false,
      pet: false,
    },
  },
  step2: {
    receiveUpdates: false,
    agreeToTerms: false,
    agreeToPrivacy: false,
  },
  pricing: null,
  pricingLoading: false,
  step4: {
    paymentMethod: 'card',
    sameAsBilling: true,
  },
  bookingReference: null,
};

const STORAGE_KEY = 'loftly_booking_state';

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<BookingState>(INITIAL_STATE);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage AFTER initial render (after hydration)
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        if (parsed.step1?.checkInDate) {
          parsed.step1.checkInDate = new Date(parsed.step1.checkInDate);
        }
        if (parsed.step1?.checkOutDate) {
          parsed.step1.checkOutDate = new Date(parsed.step1.checkOutDate);
        }
        setState(parsed);
      } catch (error) {
        console.error('Failed to parse booking state from localStorage:', error);
      }
    }
    setIsHydrated(true);
  }, []); // Empty dependency array - only run once after mount

  // Save to localStorage whenever state changes (but only after hydration)
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state, isHydrated]);

  // Auto-calculate pricing when step1 has valid data
  useEffect(() => {
    const { propertyId, checkInDate, checkOutDate, adults, children, infants, specialRequests } = state.step1;

    if (propertyId && checkInDate && checkOutDate && isHydrated) {
      const hasPet = specialRequests?.pet || false;
      const totalGuests = (adults || 1) + (children || 0) + (infants || 0);

      // Set loading state
      setState((prev) => ({
        ...prev,
        pricingLoading: true,
      }));

      // Fetch real-time pricing from Guestly
      fetchGuestlyPricing(propertyId, checkInDate, checkOutDate, totalGuests, hasPet)
        .then((pricing) => {
          console.log('[Booking Context] Updated pricing from Guestly:', pricing);
          setState((prev) => ({
            ...prev,
            pricing,
            pricingLoading: false,
          }));
        })
        .catch((error) => {
          console.error('[Booking Context] Failed to fetch pricing:', error);
          // Fallback to local pricing
          const fallbackPricing = calculateTotalPrice(propertyId, checkInDate, checkOutDate, hasPet);
          setState((prev) => ({
            ...prev,
            pricing: fallbackPricing,
            pricingLoading: false,
          }));
        });
    }
  }, [state.step1.propertyId, state.step1.checkInDate, state.step1.checkOutDate, state.step1.adults, state.step1.children, state.step1.infants, state.step1.specialRequests?.pet, isHydrated]);

  const updateStep1 = (data: Partial<Step1Data>) => {
    console.log('[BOOKING CONTEXT] updateStep1 called with:', data);
    setState((prev) => {
      const newStep1 = { ...prev.step1, ...data };
      console.log('[BOOKING CONTEXT] New step1 state:', newStep1);
      return {
        ...prev,
        step1: newStep1,
      };
    });
  };

  const updateStep2 = (data: Partial<Step2Data>) => {
    setState((prev) => ({
      ...prev,
      step2: { ...prev.step2, ...data },
    }));
  };

  const updateStep4 = (data: Partial<Step4Data>) => {
    setState((prev) => ({
      ...prev,
      step4: { ...prev.step4, ...data },
    }));
  };

  const setBookingReference = (ref: string) => {
    setState((prev) => ({
      ...prev,
      bookingReference: ref,
    }));
  };

  const calculatePricing = () => {
    const { propertyId, checkInDate, checkOutDate, specialRequests } = state.step1;

    if (!propertyId || !checkInDate || !checkOutDate) {
      setState((prev) => ({ ...prev, pricing: null }));
      return;
    }

    const hasPet = specialRequests?.pet || false;
    const pricing = calculateTotalPrice(propertyId, checkInDate, checkOutDate, hasPet);

    setState((prev) => ({
      ...prev,
      pricing,
    }));
  };

  const nextStep = () => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.min(prev.currentStep + 1, 5),
    }));
  };

  const previousStep = () => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, 1),
    }));
  };

  const goToStep = (step: number) => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.max(1, Math.min(step, 5)),
    }));
  };

  const resetBooking = () => {
    setState(INITIAL_STATE);
    localStorage.removeItem(STORAGE_KEY);
  };

  const value: BookingContextType = {
    state,
    updateStep1,
    updateStep2,
    updateStep4,
    setBookingReference,
    calculatePricing,
    nextStep,
    previousStep,
    goToStep,
    resetBooking,
  };

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
}
