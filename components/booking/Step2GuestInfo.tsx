'use client';
import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { ChevronLeftIcon } from '../ui/Icons';
import { step2Schema, Step2Data } from '../../lib/validation/booking';
import { useBooking } from '../../lib/context/BookingContext';

const COUNTRIES = [
  { value: 'DE', label: 'Germany' },
  { value: 'US', label: 'United States' },
  { value: 'UK', label: 'United Kingdom' },
  { value: 'FR', label: 'France' },
  { value: 'IT', label: 'Italy' },
  { value: 'ES', label: 'Spain' },
  { value: 'NL', label: 'Netherlands' },
  { value: 'BE', label: 'Belgium' },
  { value: 'AT', label: 'Austria' },
  { value: 'CH', label: 'Switzerland' },
  { value: 'PL', label: 'Poland' },
  { value: 'SE', label: 'Sweden' },
  { value: 'DK', label: 'Denmark' },
  { value: 'NO', label: 'Norway' },
  { value: 'FI', label: 'Finland' },
  { value: 'OTHER', label: 'Other' },
];

const PURPOSE_OPTIONS = [
  { value: 'business', label: '' },
  { value: 'leisure', label: '' },
  { value: 'hospital', label: '' },
  { value: 'other', label: '' },
];

export function Step2GuestInfo() {
  const t = useTranslations('booking.step2');
  const tl = useTranslations('booking');
  const { state, updateStep2, nextStep, previousStep } = useBooking();

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(step2Schema),
    mode: 'onChange',
    defaultValues: {
      firstName: state.step2.firstName || '',
      lastName: state.step2.lastName || '',
      email: state.step2.email || '',
      phone: state.step2.phone || '',
      country: state.step2.country || '',
      company: state.step2.company || '',
      purposeOfStay: state.step2.purposeOfStay,
      specialRequests: state.step2.specialRequests || '',
      agreeToTerms: state.step2.agreeToTerms || false,
      agreeToPrivacy: state.step2.agreeToPrivacy || false,
      receiveUpdates: state.step2.receiveUpdates || false,
    },
  });

  const onSubmit = (data: Step2Data) => {
    updateStep2(data);
    nextStep();
  };

  // Translate purpose options
  const translatedPurposeOptions = PURPOSE_OPTIONS.map((opt) => ({
    value: opt.value,
    label: t(`purpose.${opt.value}`),
  }));

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Back Navigation */}
      <button
        type="button"
        onClick={previousStep}
        className="flex items-center gap-2 text-neutral-700 hover:text-primary-600 transition-colors group mb-6"
      >
        <ChevronLeftIcon size={20} className="group-hover:-translate-x-1 transition-transform" />
        <span className="font-medium">{tl('back')} to Property & Dates</span>
      </button>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle>{t('personalInfo')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <Controller
              name="firstName"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label={t('firstName')}
                  placeholder={t('firstNamePlaceholder')}
                  error={errors.firstName?.message}
                  fullWidth
                  required
                />
              )}
            />

            <Controller
              name="lastName"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label={t('lastName')}
                  placeholder={t('lastNamePlaceholder')}
                  error={errors.lastName?.message}
                  fullWidth
                  required
                />
              )}
            />

            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="email"
                  label={t('email')}
                  placeholder={t('emailPlaceholder')}
                  error={errors.email?.message}
                  fullWidth
                  required
                />
              )}
            />

            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="tel"
                  label={t('phone')}
                  placeholder={t('phonePlaceholder')}
                  error={errors.phone?.message}
                  fullWidth
                  required
                />
              )}
            />

            <Controller
              name="country"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  label={t('country')}
                  options={COUNTRIES}
                  placeholder={t('countryPlaceholder')}
                  error={errors.country?.message}
                  fullWidth
                  required
                />
              )}
            />

            <Controller
              name="company"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label={t('company')}
                  placeholder={t('companyPlaceholder')}
                  helperText={t('optional')}
                  fullWidth
                />
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Stay Details */}
      <Card>
        <CardHeader>
          <CardTitle>{t('stayDetails')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Controller
              name="purposeOfStay"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  label={t('purposeOfStay')}
                  options={translatedPurposeOptions}
                  placeholder={t('purposePlaceholder')}
                  error={errors.purposeOfStay?.message}
                  fullWidth
                  required
                />
              )}
            />

            <Controller
              name="specialRequests"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  label={t('specialRequestsLabel')}
                  placeholder={t('specialRequestsPlaceholder')}
                  helperText={t('optional')}
                  rows={4}
                  fullWidth
                />
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* GDPR Consent */}
      <Card>
        <CardHeader>
          <CardTitle>{t('consent')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Controller
              name="agreeToTerms"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="mt-1 w-5 h-5 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm">
                      {t('agreeToTerms')}{' '}
                      <Link href="/terms" className="text-primary-600 hover:underline" target="_blank">
                        {t('termsLink')}
                      </Link>
                      *
                    </span>
                  </label>
                  {errors.agreeToTerms && (
                    <p className="mt-1 text-sm text-red-600">{errors.agreeToTerms.message}</p>
                  )}
                </div>
              )}
            />

            <Controller
              name="agreeToPrivacy"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="mt-1 w-5 h-5 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm">
                      {t('agreeToPrivacy')}{' '}
                      <Link href="/privacy" className="text-primary-600 hover:underline" target="_blank">
                        {t('privacyLink')}
                      </Link>
                      *
                    </span>
                  </label>
                  {errors.agreeToPrivacy && (
                    <p className="mt-1 text-sm text-red-600">{errors.agreeToPrivacy.message}</p>
                  )}
                </div>
              )}
            />

            <Controller
              name="receiveUpdates"
              control={control}
              render={({ field }) => (
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={field.onChange}
                    className="mt-1 w-5 h-5 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm">{t('receiveUpdates')}</span>
                </label>
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button type="button" variant="outline" size="lg" onClick={previousStep}>
          {tl('back')}
        </Button>
        <Button type="submit" size="lg" disabled={!isValid}>
          {tl('continue')}
        </Button>
      </div>
    </form>
  );
}
