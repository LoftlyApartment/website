import { type ClassValue, clsx } from 'clsx';
import { format, differenceInDays } from 'date-fns';
import { FEES, CURRENCY_SYMBOL } from '@/lib/constants';
import type { PriceCalculation } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(date: Date | string, formatStr: string = 'dd.MM.yyyy'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, formatStr);
}

export function formatPrice(amount: number, currency: string = CURRENCY_SYMBOL): string {
  return `${currency}${amount.toFixed(2)}`;
}

export function calculateNights(checkIn: Date, checkOut: Date): number {
  return differenceInDays(checkOut, checkIn);
}

export function calculateBookingPrice(
  pricePerNight: number,
  checkIn: Date,
  checkOut: Date
): PriceCalculation {
  const nights = calculateNights(checkIn, checkOut);
  const basePrice = pricePerNight * nights;
  const cleaningFee = basePrice * FEES.CLEANING_FEE_PERCENTAGE;
  const serviceFee = basePrice * FEES.SERVICE_FEE_PERCENTAGE;
  const subtotal = basePrice + cleaningFee + serviceFee;
  const tax = subtotal * FEES.TAX_PERCENTAGE;
  const total = subtotal + tax;

  return {
    base_price: basePrice,
    cleaning_fee: cleaningFee,
    service_fee: serviceFee,
    tax,
    total,
    nights,
  };
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export async function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'An unknown error occurred';
}

export function isDateInRange(date: Date, start: Date, end: Date): boolean {
  return date >= start && date <= end;
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}
