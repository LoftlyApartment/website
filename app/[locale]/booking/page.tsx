'use client';

import { useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { BookingProvider, useBooking } from '../../../lib/context/BookingContext';
import { BookingProgress } from '../../../components/booking/BookingProgress';
import { Step1PropertyDates } from '../../../components/booking/Step1PropertyDates';
import { Step2GuestInfo } from '../../../components/booking/Step2GuestInfo';
import { Step3Pricing } from '../../../components/booking/Step3Pricing';
import { Step4Payment } from '../../../components/booking/Step4Payment';
import { Step5Confirmation } from '../../../components/booking/Step5Confirmation';

function BookingContent() {
  const searchParams = useSearchParams();
  const { state, updateStep1, goToStep, setBookingReference } = useBooking();
  const stepProcessedRef = useRef(false);

  // Parse query parameters on mount - ONLY ONCE to prevent infinite loop
  useEffect(() => {
    const step = searchParams.get('step');
    const bookingRef = searchParams.get('booking_reference');

    // Save booking reference if present (from Stripe redirect)
    if (bookingRef && !stepProcessedRef.current) {
      setBookingReference(bookingRef);
    }

    // Handle step parameter (for Stripe redirect) - only once
    if (step && !stepProcessedRef.current) {
      const stepNum = parseInt(step, 10);
      if (!isNaN(stepNum) && stepNum >= 1 && stepNum <= 5) {
        stepProcessedRef.current = true;
        goToStep(stepNum);
      }
    }

    const propertyId = searchParams.get('propertyId');
    const checkIn = searchParams.get('checkIn');
    const checkOut = searchParams.get('checkOut');
    const guests = searchParams.get('guests');

    // ONLY update if we have params AND we haven't processed them yet
    if ((propertyId || checkIn || checkOut || guests) && !stepProcessedRef.current) {
      const updates: any = {};

      if (propertyId) {
        updates.propertyId = propertyId;
        console.log('[BOOKING PAGE] Setting propertyId from URL:', propertyId);
      }

      if (checkIn) {
        try {
          updates.checkInDate = new Date(checkIn);
        } catch (e) {
          console.error('Invalid check-in date:', checkIn);
        }
      }

      if (checkOut) {
        try {
          updates.checkOutDate = new Date(checkOut);
        } catch (e) {
          console.error('Invalid check-out date:', checkOut);
        }
      }

      if (guests) {
        const guestCount = parseInt(guests, 10);
        if (!isNaN(guestCount)) {
          updates.adults = guestCount;
        }
      }

      if (Object.keys(updates).length > 0) {
        console.log('[BOOKING PAGE] Calling updateStep1 with:', updates);
        stepProcessedRef.current = true; // Mark as processed to prevent loop
        updateStep1(updates);
      }
    }
  }, [searchParams]); // Removed updateStep1 from dependencies to prevent infinite loop

  const renderStep = () => {
    switch (state.currentStep) {
      case 1:
        return <Step1PropertyDates />;
      case 2:
        return <Step2GuestInfo />;
      case 3:
        return <Step3Pricing />;
      case 4:
        return <Step4Payment />;
      case 5:
        return <Step5Confirmation />;
      default:
        return <Step1PropertyDates />;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Progress Indicator */}
      <BookingProgress currentStep={state.currentStep} />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {renderStep()}
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <BookingProvider>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      }>
        <BookingContent />
      </Suspense>
    </BookingProvider>
  );
}
