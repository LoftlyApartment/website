'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Alert } from '@/components/ui/Alert';

const createContactSchema = (t: any) => z.object({
  name: z.string().min(1, t('contact.form.nameRequired')),
  email: z.string().min(1, t('contact.form.emailRequired')).email(t('contact.form.emailInvalid')),
  phone: z.string().optional(),
  property: z.string().optional(),
  message: z.string().min(10, t('contact.form.messageMin')),
});

type ContactFormData = z.infer<ReturnType<typeof createContactSchema>>;

export const ContactForm = () => {
  const t = useTranslations();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(createContactSchema(t)),
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Simulate API call - replace with actual API endpoint
      await new Promise((resolve) => setTimeout(resolve, 1500));

      console.log('Form submitted:', data);
      setSubmitStatus('success');
      reset();

      // Reset success message after 5 seconds
      setTimeout(() => {
        setSubmitStatus('idle');
      }, 5000);
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {submitStatus === 'success' && (
        <Alert variant="success">
          {t('contact.form.success')}
        </Alert>
      )}

      {submitStatus === 'error' && (
        <Alert variant="error">
          {t('contact.form.error')}
        </Alert>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <Input
          {...register('name')}
          label={t('contact.form.name')}
          placeholder={t('contact.form.namePlaceholder')}
          error={errors.name?.message}
          fullWidth
          disabled={isSubmitting}
        />

        <Input
          {...register('email')}
          type="email"
          label={t('contact.form.email')}
          placeholder={t('contact.form.emailPlaceholder')}
          error={errors.email?.message}
          fullWidth
          disabled={isSubmitting}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Input
          {...register('phone')}
          type="tel"
          label={t('contact.form.phone')}
          placeholder={t('contact.form.phonePlaceholder')}
          error={errors.phone?.message}
          fullWidth
          disabled={isSubmitting}
        />

        <div className="flex flex-col gap-1 w-full">
          <label className="text-sm font-medium text-neutral-700">
            {t('contact.form.property')}
          </label>
          <select
            {...register('property')}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-lg border border-neutral-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:border-primary-500 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-neutral-50"
          >
            <option value="">{t('contact.form.propertyPlaceholder')}</option>
            <option value="kantstrasse">{t('contact.form.propertyKant')}</option>
            <option value="hindenburgdamm">{t('contact.form.propertyHinden')}</option>
            <option value="general">{t('contact.form.propertyGeneral')}</option>
          </select>
        </div>
      </div>

      <Textarea
        {...register('message')}
        label={t('contact.form.message')}
        placeholder={t('contact.form.messagePlaceholder')}
        error={errors.message?.message}
        fullWidth
        rows={6}
        disabled={isSubmitting}
      />

      <Button
        type="submit"
        size="lg"
        fullWidth
        loading={isSubmitting}
        disabled={isSubmitting}
      >
        {isSubmitting ? t('contact.form.sending') : t('contact.form.submit')}
      </Button>
    </form>
  );
};
