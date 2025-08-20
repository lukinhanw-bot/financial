import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

interface Option {
  value: string;
  label: string;
  icon?: string;
  color?: string;
}

interface CustomSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Selecione uma opção",
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);
  
  const selectedOption = options.find(option => option.value === value);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };
  
  return (
    <div ref={selectRef} className={`relative ${className}`}>
      <motion.button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full p-3 border rounded-lg text-left flex items-center justify-between
          transition-all duration-200 bg-white
          ${isOpen 
            ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-lg' 
            : 'border-gray-300 hover:border-gray-400'
          }
        `}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center gap-3">
          {selectedOption ? (
            <>
              {selectedOption.icon && (
                <span className="text-lg">{selectedOption.icon}</span>
              )}
              <span className="text-gray-900">{selectedOption.label}</span>
            </>
          ) : (
            <span className="text-gray-500">{placeholder}</span>
          )}
        </div>
        
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={20} className="text-gray-400" />
        </motion.div>
      </motion.button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto"
          >
            {options.map((option) => (
              <motion.button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={`
                  w-full p-3 text-left flex items-center justify-between hover:bg-gray-50
                  transition-colors border-b border-gray-100 last:border-b-0
                  ${value === option.value ? 'bg-blue-50 text-blue-700' : 'text-gray-900'}
                `}
                whileHover={{ backgroundColor: value === option.value ? '#dbeafe' : '#f9fafb' }}
              >
                <div className="flex items-center gap-3">
                  {option.icon && (
                    <span className="text-lg">{option.icon}</span>
                  )}
                  <span>{option.label}</span>
                </div>
                
                {value === option.value && (
                  <Check size={16} className="text-blue-600" />
                )}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};