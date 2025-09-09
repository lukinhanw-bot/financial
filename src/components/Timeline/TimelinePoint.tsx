import React from 'react';
import { motion } from 'framer-motion';
import { DailyBalance } from '../../types';
import { formatCurrency, formatDate } from '../../utils/financialCalculations';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface TimelinePointProps {
  dailyBalance: DailyBalance;
  index: number;
  isActive: boolean;
  onClick: () => void;
  isAlternate: boolean;
}

export const TimelinePoint: React.FC<TimelinePointProps> = ({
  dailyBalance,
  index,
  isActive,
  onClick,
  isAlternate,
}) => {
  const { date, balance, transactions } = dailyBalance;

  const totalIncome = transactions
    .filter(t => t.type === 'income' && t.received)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netChange = totalIncome - totalExpense;
  const hasTransactions = transactions.length > 0;

  return (
    <div
      className={`relative flex flex-col items-center min-w-[220px] mx-6 ${isAlternate ? 'flex-col-reverse' : 'flex-col'
        }`}
    >
      {/* Balance Card */}
      <motion.div
        className={`
          relative p-5 rounded-2xl shadow-lg cursor-pointer transition-all duration-300 mb-4
          ${isActive
            ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white scale-105 shadow-2xl'
            : 'bg-white/90 backdrop-blur-sm hover:bg-white hover:scale-102 shadow-md border border-gray-100'
          }
          ${isAlternate ? 'mt-4 mb-0' : ''}
        `}
        onClick={onClick}
        whileHover={{ scale: isActive ? 1.05 : 1.02 }}
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0, y: isAlternate ? -20 : 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
      >
        {/* Date */}
        <div className={`text-sm font-semibold mb-3 ${isActive ? 'text-blue-100' : 'text-gray-600'}`}>
          {formatDate(date)}
        </div>

        {/* Balance */}
        <div className={`text-xl font-bold mb-3 ${isActive ? 'text-white' : 'text-gray-900'}`}>
          {formatCurrency(balance)}
        </div>

        {/* Net Change */}
        {hasTransactions && (
          <div className={`flex items-center gap-2 text-sm font-medium ${isActive
              ? netChange > 0 ? 'text-green-200' : netChange < 0 ? 'text-red-200' : 'text-gray-200'
              : netChange > 0 ? 'text-green-600' : netChange < 0 ? 'text-red-600' : 'text-gray-600'
            }`}>
            {netChange > 0 ? (
              <ArrowUp size={16} />
            ) : netChange < 0 ? (
              <ArrowDown size={16} />
            ) : (
              <div className="w-4 h-4 rounded-full bg-gray-400" />
            )}
            {netChange !== 0 ? formatCurrency(Math.abs(netChange)) : 'R$ 0,00'}
          </div>
        )}

      </motion.div>

      {/* Timeline Point */}
      <div className="relative z-10">
        <motion.div
          className={`
            w-6 h-6 rounded-full border-4 transition-all duration-300 relative
            ${hasTransactions
              ? netChange > 0
                ? 'bg-gradient-to-br from-green-400 to-green-600 border-green-300 shadow-lg shadow-green-500/30'
                : netChange < 0
                  ? 'bg-gradient-to-br from-red-400 to-red-600 border-red-300 shadow-lg shadow-red-500/30'
                  : 'bg-gradient-to-br from-gray-400 to-gray-500 border-gray-300 shadow-lg shadow-gray-500/30'
              : 'bg-gradient-to-br from-gray-300 to-gray-400 border-gray-200'
            }
            ${isActive ? 'scale-125 shadow-xl' : 'hover:scale-110'}
          `}
          whileHover={{ scale: isActive ? 1.25 : 1.1 }}
          initial={{ scale: 0 }}
          animate={{ scale: isActive ? 1.25 : 1 }}
          transition={{ delay: index * 0.1 + 0.2, type: "spring", stiffness: 300 }}
        />

        {/* Transaction Count Badge */}
        {hasTransactions && (
          <motion.div
            className={`
              absolute -top-3 -right-3 w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold shadow-lg
              ${netChange > 0
                ? 'bg-gradient-to-br from-green-500 to-green-600 text-white'
                : netChange < 0
                  ? 'bg-gradient-to-br from-red-500 to-red-600 text-white'
                  : 'bg-gradient-to-br from-gray-500 to-gray-600 text-white'
              }
            `}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.1 + 0.4, type: "spring", stiffness: 400 }}
          >
            {transactions.length}
          </motion.div>
        )}
      </div>
    </div>
  );
};