import React, { useState } from 'react';
import { Repeat, Calendar, X } from 'lucide-react';

interface RecurringToggleProps {
  isRecurring: boolean;
  onToggle: (isRecurring: boolean) => void;
  recurringType: string;
  onTypeChange: (type: string) => void;
  recurringInterval: number;
  onIntervalChange: (interval: number) => void;
  recurringEndDate: string;
  onEndDateChange: (date: string) => void;
}

export const RecurringToggle: React.FC<RecurringToggleProps> = ({
  isRecurring,
  onToggle,
  recurringType,
  onTypeChange,
  recurringInterval,
  onIntervalChange,
  recurringEndDate,
  onEndDateChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const recurringOptions = [
    { value: 'daily', label: 'Diário' },
    { value: 'weekly', label: 'Semanal' },
    { value: 'monthly', label: 'Mensal' },
    { value: 'yearly', label: 'Anual' },
  ];

  const handleToggle = () => {
    const newValue = !isRecurring;
    onToggle(newValue);
    setIsExpanded(newValue);
    
    if (!newValue) {
      // Reset values when disabling
      onTypeChange('monthly');
      onIntervalChange(1);
      onEndDateChange('');
    }
  };

  return (
    <div className="space-y-2">
      {/* Toggle Button */}
      <button
        type="button"
        onClick={handleToggle}
        className={`
          w-full flex items-center justify-between p-2.5 rounded-lg border-2 transition-colors
          ${isRecurring 
            ? 'border-indigo-500 bg-indigo-50 text-indigo-700' 
            : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
          }
        `}
      >
        <div className="flex items-center gap-2">
          <Repeat size={16} />
          <span className="font-medium text-sm">Conta Fixa (Recorrente)</span>
        </div>
        <div className={`
          w-4 h-4 rounded border-2 flex items-center justify-center
          ${isRecurring ? 'border-indigo-500 bg-indigo-500' : 'border-gray-300'}
        `}>
          {isRecurring && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
        </div>
      </button>

      {/* Recurring Options */}
      {isRecurring && (
        <div className="space-y-2 p-3 bg-gray-50 rounded-lg border">
          {/* Type and Interval */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Repetir
              </label>
              <select
                value={recurringType}
                onChange={(e) => onTypeChange(e.target.value)}
                className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {recurringOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                A cada
              </label>
              <input
                type="number"
                min="1"
                max="365"
                value={recurringInterval}
                onChange={(e) => onIntervalChange(parseInt(e.target.value) || 1)}
                className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* End Date */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Data de término (opcional)
            </label>
            <div className="relative">
              <Calendar size={14} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                value={recurringEndDate}
                onChange={(e) => onEndDateChange(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Deixe vazio para repetir indefinidamente
            </p>
          </div>

          {/* Preview */}
          <div className="p-2 bg-white rounded border">
            <p className="text-xs text-gray-600">
              <strong>Preview:</strong> Esta transação será repetida{' '}
              {recurringInterval === 1 ? 'todo' : `a cada ${recurringInterval}`}{' '}
              {recurringOptions.find(opt => opt.value === recurringType)?.label.toLowerCase()}
              {recurringEndDate && ` até ${new Date(recurringEndDate).toLocaleDateString('pt-BR')}`}.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
