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
  const [inputValue, setInputValue] = useState(value);
  
  // Sincroniza o inputValue com o value externo
  useEffect(() => {
    setInputValue(value);
  }, [value]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // Permite apenas números, vírgula e ponto
    const cleaned = newValue.replace(/[^\d,.-]/g, '');
    
    setInputValue(cleaned);
    
    // Converte para número e envia para o parent
    const normalized = cleaned.replace(',', '.');
    const numValue = parseFloat(normalized);
    
    if (cleaned === '') {
      onChange('');
    } else if (!isNaN(numValue)) {
      onChange(numValue.toString());
    } else {
      onChange(cleaned);
    }
  };
  
  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
        <DollarSign size={18} />
      </div>
      <input
        type="text"
        value={inputValue}
        onChange={handleChange}
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