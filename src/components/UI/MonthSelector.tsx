import React from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface MonthSelectorProps {
  currentMonth: number;
  currentYear: number;
  onMonthChange: (month: number, year: number) => void;
}

export const MonthSelector: React.FC<MonthSelectorProps> = ({
  currentMonth,
  currentYear,
  onMonthChange,
}) => {
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      onMonthChange(11, currentYear - 1);
    } else {
      onMonthChange(currentMonth - 1, currentYear);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      onMonthChange(0, currentYear + 1);
    } else {
      onMonthChange(currentMonth + 1, currentYear);
    }
  };

  const goToCurrentMonth = () => {
    const now = new Date();
    onMonthChange(now.getMonth(), now.getFullYear());
  };

  return (
    <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
      {/* Previous Month */}
      <button
        onClick={goToPreviousMonth}
        className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
        title="Mês anterior"
      >
        <ChevronLeft size={18} className="text-white" />
      </button>

      {/* Current Month/Year */}
      <div className="flex items-center gap-2 min-w-0">
        <Calendar size={18} className="text-white flex-shrink-0" />
        <div className="text-center">
          <div className="text-white font-semibold text-sm">
            {monthNames[currentMonth]}
          </div>
          <div className="text-white/80 text-xs">
            {currentYear}
          </div>
        </div>
      </div>

      {/* Next Month */}
      <button
        onClick={goToNextMonth}
        className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
        title="Próximo mês"
      >
        <ChevronRight size={18} className="text-white" />
      </button>

      {/* Current Month Button */}
      <button
        onClick={goToCurrentMonth}
        className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-white text-xs font-medium"
        title="Ir para o mês atual"
      >
        Hoje
      </button>
    </div>
  );
};
