import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';

interface DateInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const DateInput: React.FC<DateInputProps> = ({
  value,
  onChange,
  className = "",
}) => {
  const [displayValue, setDisplayValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  
  useEffect(() => {
    if (value && !isFocused) {
      // Format date for display (DD/MM/YYYY)
      // Parse the date string directly to avoid timezone issues
      const [year, month, day] = value.split('-');
      if (year && month && day) {
        const dayNum = parseInt(day);
        const monthNum = parseInt(month);
        const yearNum = parseInt(year);
        
        if (dayNum >= 1 && dayNum <= 31 && monthNum >= 1 && monthNum <= 12 && yearNum >= 1900) {
          setDisplayValue(`${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`);
        }
      }
    } else if (!value) {
      setDisplayValue('');
    }
  }, [value, isFocused]);
  
  const formatDateInput = (input: string): string => {
    // Remove all non-numeric characters
    const numbers = input.replace(/\D/g, '');
    
    // Apply mask DD/MM/YYYY
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 4) {
      return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
    } else {
      return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
    }
  };
  
  const parseDate = (formattedDate: string): string => {
    // Extract numbers from formatted date
    const numbers = formattedDate.replace(/\D/g, '');
    
    if (numbers.length === 8) {
      const day = numbers.slice(0, 2);
      const month = numbers.slice(2, 4);
      const year = numbers.slice(4, 8);
      
      // Validate date components
      const dayNum = parseInt(day);
      const monthNum = parseInt(month);
      const yearNum = parseInt(year);
      
      if (dayNum >= 1 && dayNum <= 31 && monthNum >= 1 && monthNum <= 12 && yearNum >= 1900) {
        // Return in ISO format (YYYY-MM-DD)
        return `${year}-${month}-${day}`;
      }
    }
    
    return '';
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const formatted = formatDateInput(inputValue);
    setDisplayValue(formatted);
    
    // Parse and update parent component
    const parsedDate = parseDate(formatted);
    onChange(parsedDate);
  };
  
  const handleFocus = () => {
    setIsFocused(true);
  };
  
  const handleBlur = () => {
    setIsFocused(false);
    
    // Validate and format final date
    const parsedDate = parseDate(displayValue);
    if (parsedDate) {
      onChange(parsedDate);
    } else if (displayValue) {
      // If invalid date, clear the field
      setDisplayValue('');
      onChange('');
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow backspace, delete, tab, escape, enter
    if ([8, 9, 27, 13, 46].includes(e.keyCode)) {
      return;
    }
    
    // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
    if (e.ctrlKey && [65, 67, 86, 88].includes(e.keyCode)) {
      return;
    }
    
    // Only allow numbers
    if (e.keyCode < 48 || e.keyCode > 57) {
      e.preventDefault();
    }
  };
  
  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
        <Calendar size={18} />
      </div>
      <input
        type="text"
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={`
          w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg 
          focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
          transition-colors bg-white text-gray-900
          ${className}
        `}
        placeholder="DD/MM/AAAA"
        maxLength={10}
      />
    </div>
  );
};