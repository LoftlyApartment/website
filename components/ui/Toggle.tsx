import React from 'react';
import clsx from 'clsx';

export interface ToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
  label?: string;
  id?: string;
}

export const Toggle: React.FC<ToggleProps> = ({
  enabled,
  onChange,
  disabled = false,
  label,
  id,
}) => {
  const handleToggle = () => {
    if (!disabled) {
      onChange(!enabled);
    }
  };

  const toggleId = id || `toggle-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="flex items-center">
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-labelledby={label ? `${toggleId}-label` : undefined}
        id={toggleId}
        disabled={disabled}
        onClick={handleToggle}
        className={clsx(
          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
          enabled ? 'bg-primary-600' : 'bg-neutral-300',
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        )}
      >
        <span
          className={clsx(
            'inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out shadow-sm',
            enabled ? 'translate-x-6' : 'translate-x-1'
          )}
        />
      </button>
      {label && (
        <label
          htmlFor={toggleId}
          id={`${toggleId}-label`}
          className={clsx(
            'ml-3 text-sm font-medium text-neutral-700',
            disabled ? 'opacity-50' : 'cursor-pointer'
          )}
          onClick={() => !disabled && handleToggle()}
        >
          {label}
        </label>
      )}
    </div>
  );
};
