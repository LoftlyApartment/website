import React, { forwardRef, ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';
import { LoaderIcon } from './Icons';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className = '',
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled = false,
      icon,
      iconPosition = 'left',
      fullWidth = false,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variantStyles = {
      primary: 'bg-luxury-beige-600 text-white hover:bg-luxury-beige-700 focus:ring-luxury-gold-500 active:bg-luxury-beige-800 shadow-sm hover:shadow-md',
      secondary: 'bg-white border-2 border-luxury-beige-300 text-luxury-charcoal-900 hover:bg-luxury-cream-50 focus:ring-luxury-beige-600 active:bg-luxury-cream-100 shadow-sm hover:shadow-md',
      outline: 'border-2 border-luxury-beige-600 text-luxury-beige-600 hover:bg-luxury-beige-50 focus:ring-luxury-beige-500 active:bg-luxury-beige-100',
      ghost: 'text-luxury-charcoal-800 hover:bg-luxury-cream-100 focus:ring-luxury-beige-500 active:bg-luxury-cream-200',
      gold: 'bg-luxury-gold-600 text-luxury-obsidian-950 hover:bg-luxury-gold-500 focus:ring-luxury-gold-500 active:bg-luxury-gold-400 shadow-sm hover:shadow-md font-semibold',
    };

    const sizeStyles = {
      sm: 'text-sm px-3 py-1.5 min-h-[32px]',
      md: 'text-base px-4 py-2 min-h-[40px]',
      lg: 'text-lg px-6 py-3 min-h-[48px]',
    };

    const widthStyles = fullWidth ? 'w-full' : '';

    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={clsx(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          widthStyles,
          className
        )}
        aria-busy={loading}
        {...props}
      >
        {loading && <LoaderIcon size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20} />}
        {!loading && icon && iconPosition === 'left' && icon}
        {children}
        {!loading && icon && iconPosition === 'right' && icon}
      </button>
    );
  }
);

Button.displayName = 'Button';
