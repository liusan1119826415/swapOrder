'use client';

import { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { AlertCircle, Check } from 'lucide-react';

interface PriceInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  currency?: 'ETH' | 'WETH';
  onCurrencyChange?: (currency: 'ETH' | 'WETH') => void;
  min?: string;
  max?: string;
  showBalance?: boolean;
  balance?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export default function PriceInput({
  value,
  onChange,
  label = 'Price',
  placeholder = '0.00',
  currency = 'ETH',
  onCurrencyChange,
  min,
  max,
  showBalance = false,
  balance,
  error,
  disabled = false,
  className,
}: PriceInputProps) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    // Only allow numbers and decimal point
    if (inputValue === '' || /^\d*\.?\d*$/.test(inputValue)) {
      setLocalValue(inputValue);
      onChange(inputValue);
    }
  };

  const handleBlur = () => {
    // Format value on blur
    if (localValue && !isNaN(parseFloat(localValue))) {
      setLocalValue(parseFloat(localValue).toFixed(6));
      onChange(parseFloat(localValue).toString());
    }
  };

  const currencies: ('ETH' | 'WETH')[] = ['ETH', 'WETH'];

  return (
    <div className={clsx('space-y-2', className)}>
      {label && (
        <label className="block text-sm text-slate-400 font-label uppercase tracking-widest">
          {label}
        </label>
      )}
      
      <div className={clsx(
        'relative flex items-center bg-surface-container-low border rounded-xl overflow-hidden transition-all',
        error ? 'border-red-400/50 focus-within:border-red-400' : 'border-outline-variant/20 focus-within:border-primary/50',
        disabled && 'opacity-50 cursor-not-allowed'
      )}>
        <input
          type="text"
          inputMode="decimal"
          value={localValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          disabled={disabled}
          placeholder={placeholder}
          className="flex-1 bg-transparent px-4 py-4 text-xl font-headline font-bold text-on-surface placeholder:text-slate-600 focus:outline-none"
        />
        
        {/* Currency Toggle */}
        <div className="flex bg-surface-container-high mr-1 rounded-lg p-1">
          {currencies.map((curr) => (
            <button
              key={curr}
              type="button"
              onClick={() => onCurrencyChange?.(curr)}
              disabled={disabled}
              className={clsx(
                'px-3 py-1.5 rounded-md text-xs font-headline font-bold transition-all',
                currency === curr
                  ? 'bg-primary text-on-primary shadow-lg shadow-primary/20'
                  : 'text-slate-400 hover:text-on-surface'
              )}
            >
              {curr}
            </button>
          ))}
        </div>
      </div>

      {/* Balance Display */}
      {showBalance && balance && (
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-500">Available</span>
          <button
            type="button"
            onClick={() => onChange(balance)}
            disabled={disabled}
            className="text-primary hover:text-secondary transition-colors font-bold"
          >
            {balance} {currency}
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Min/Max Hints */}
      {(min || max) && (
        <div className="flex justify-between text-xs text-slate-500">
          {min && <span>Min: {min}</span>}
          {max && <span>Max: {max}</span>}
        </div>
      )}
    </div>
  );
}
