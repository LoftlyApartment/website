'use client';
import clsx from 'clsx';
import { useTranslations } from 'next-intl';
import { CheckIcon } from '../ui/Icons';
import { useBooking } from '@/lib/context/BookingContext';

interface BookingProgressProps {
  currentStep: number;
}

const STEPS = [
  { number: 1, key: 'propertyDates' },
  { number: 2, key: 'guestInfo' },
  { number: 3, key: 'pricing' },
  { number: 4, key: 'payment' },
  { number: 5, key: 'confirmation' },
];

export function BookingProgress({ currentStep }: BookingProgressProps) {
  const t = useTranslations('booking.progress');
  const { goToStep } = useBooking();

  const handleStepClick = (stepNumber: number) => {
    // Only allow clicking on completed steps (steps before current step)
    // Don't allow clicking on current step or future steps
    // Don't allow clicking to step 5 (confirmation) from earlier steps
    if (stepNumber < currentStep && stepNumber !== 5) {
      goToStep(stepNumber);
    }
  };

  const isStepClickable = (stepNumber: number) => {
    return stepNumber < currentStep && stepNumber !== 5;
  };

  return (
    <div className="w-full bg-white border-b border-neutral-200 sticky top-20 md:top-24 z-40 py-4">
      <div className="container mx-auto px-4 py-6">
        {/* Desktop Progress */}
        <div className="hidden md:block">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">

                <div className="flex flex-col items-center flex-1">
                  <button
                    onClick={() => handleStepClick(step.number)}
                    disabled={!isStepClickable(step.number)}
                    className={clsx(
                      'w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all duration-300',
                      currentStep > step.number
                        ? 'bg-primary-600 text-white'
                        : currentStep === step.number
                        ? 'bg-primary-600 text-white ring-4 ring-primary-100'
                        : 'bg-neutral-200 text-neutral-500',
                      isStepClickable(step.number)
                        ? 'cursor-pointer hover:bg-primary-700 hover:scale-105 active:scale-95'
                        : 'cursor-default'
                    )}
                    aria-label={isStepClickable(step.number) ? `Go back to ${t(step.key)}` : t(step.key)}
                  >
                    {currentStep > step.number ? (
                      <CheckIcon size={24} />
                    ) : (
                      step.number
                    )}
                  </button>
                  <div className="mt-2 text-center">
                    <p
                      className={clsx(
                        'text-sm font-medium transition-colors',
                        currentStep >= step.number
                          ? 'text-neutral-900'
                          : 'text-neutral-500'
                      )}
                    >
                      {t(step.key)}
                    </p>
                  </div>
                </div>

                {index < STEPS.length - 1 && (
                  <div className="flex-1 h-1 mx-4 -mt-6">
                    <div
                      className={clsx(
                        'h-full rounded-full transition-all duration-300',
                        currentStep > step.number
                          ? 'bg-primary-600'
                          : 'bg-neutral-200'
                      )}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Progress */}
        <div className="md:hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center font-semibold">
                {currentStep}
              </div>
              <div>
                <p className="text-sm text-neutral-600">
                  {t('step')} {currentStep} {t('of')} {STEPS.length}
                </p>
                <p className="font-medium text-neutral-900">
                  {t(STEPS[currentStep - 1].key)}
                </p>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-600 transition-all duration-300"
              style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
