import React, { forwardRef, InputHTMLAttributes } from 'react';
import clsx from 'clsx';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      icon,
      iconPosition = 'left',
      fullWidth = false,
      className = '',
      id,
      disabled = false,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = Boolean(error);

    const baseStyles = 'px-4 py-2 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-luxury-cream-50 text-luxury-charcoal-800';

    const normalStyles = 'border-luxury-beige-300 focus:border-luxury-beige-600 focus:ring-luxury-gold-500/20';
    const errorStyles = 'border-red-500 focus:border-red-500 focus:ring-red-500';

    const iconPaddingStyles = icon
      ? iconPosition === 'left'
        ? 'pl-10'
        : 'pr-10'
      : '';

    const widthStyles = fullWidth ? 'w-full' : '';

    return (
      <div className={clsx('flex flex-col gap-1', fullWidth && 'w-full')}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-luxury-charcoal-800"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div
              className={clsx(
                'absolute top-1/2 -translate-y-1/2 flex items-center text-luxury-charcoal-600',
                iconPosition === 'left' ? 'left-3' : 'right-3'
              )}
            >
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            className={clsx(
              baseStyles,
              hasError ? errorStyles : normalStyles,
              iconPaddingStyles,
              widthStyles,
              className
            )}
            aria-invalid={hasError}
            aria-describedby={
              hasError
                ? `${inputId}-error`
                : helperText
                ? `${inputId}-helper`
                : undefined
            }
            {...props}
          />
        </div>
        {error && (
          <p id={`${inputId}-error`} className="text-sm text-red-600">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${inputId}-helper`} className="text-sm text-luxury-charcoal-600">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
