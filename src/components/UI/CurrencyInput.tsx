import React, { useState, useEffect } from 'react';
import { DollarSign } from 'lucide-react';

interface CurrencyInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  value,
  onChange,
  placeholder = "0,00",
  className = "",
}) => {
  const [displayValue, setDisplayValue] = useState('');
  
  useEffect(() => {
    if (value) {
      const numericValue = parseFloat(value);
      if (!isNaN(numericValue)) {
        setDisplayValue(formatCurrency(numericValue));
      }
    } else {
      setDisplayValue('');
    }
  }, [value]);
  
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };
  
  const parseCurrency = (formattedValue: string): string => {
    // Remove all non-numeric characters except comma and dot
    const numericString = formattedValue.replace(/[^\d,.-]/g, '');
    // Replace comma with dot for parsing
    const normalizedString = numericString.replace(',', '.');
    // Parse and return as string
    const parsed = parseFloat(normalizedString);
    return isNaN(parsed) ? '' : parsed.toString();
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Remove all non-numeric characters except comma and dot
    const numericOnly = inputValue.replace(/[^\d,.]/g, '');
    
    // Convert comma to dot for internal processing
    const normalizedValue = numericOnly.replace(',', '.');
    
    // Parse the value
    const parsed = parseFloat(normalizedValue);
    
    if (isNaN(parsed)) {
      setDisplayValue('');
      onChange('');
    } else {
      // Update display with formatted value
      setDisplayValue(formatCurrency(parsed));
      // Update parent with raw numeric value
      onChange(parsed.toString());
    }
  };
  
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Show raw numeric value when focused for easier editing
    if (value) {
      const numericValue = parseFloat(value);
      if (!isNaN(numericValue)) {
        // Show unformatted value for easier editing
        setDisplayValue(numericValue.toFixed(2).replace('.', ','));
      }
    }
  };
  
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // Format back to currency when focus is lost
    if (value) {
      const numericValue = parseFloat(value);
      if (!isNaN(numericValue)) {
        setDisplayValue(formatCurrency(numericValue));
      }
    }
  };
  
  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
        <DollarSign size={18} />
      </div>
      <input
        type="text"
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={`
          w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg 
          focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
          transition-colors bg-white text-gray-900
          ${className}
        `}
        placeholder={placeholder}
      />
    </div>
  );
};