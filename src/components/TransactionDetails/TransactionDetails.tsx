import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DailyBalance } from '../../types';
import { formatCurrency, formatDate } from '../../utils/financialCalculations';
import { ArrowUpCircle, ArrowDownCircle, Calendar, TrendingUp, TrendingDown } from 'lucide-react';

interface TransactionDetailsProps {
  dailyBalance: DailyBalance | null;
}

export const TransactionDetails: React.FC<TransactionDetailsProps> = ({ dailyBalance }) => {
  if (!dailyBalance) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <div className="text-center text-gray-500 py-12">
          <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
          <p>Selecione uma data na timeline para ver os detalhes</p>
        </div>
      </div>
    );
  }
  
  const { date, balance, transactions } = dailyBalance;
  
  const incomeTransactions = transactions.filter(t => t.type === 'income');
  const expenseTransactions = transactions.filter(t => t.type === 'expense');
  
  const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
  const netChange = totalIncome - totalExpense;
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={date}
        className="bg-white rounded-2xl p-6 shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Calendar className="text-blue-500" size={24} />
            <h3 className="text-2xl font-bold text-gray-900">
              {formatDate(date)}
            </h3>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-gray-600">Saldo Final</div>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(balance)}
            </div>
          </div>
        </div>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
            <div className="flex items-center gap-3 mb-2">
              <ArrowUpCircle className="text-green-600" size={20} />
              <span className="text-green-800 font-medium">Receitas</span>
            </div>
            <div className="text-xl font-bold text-green-900">
              {formatCurrency(totalIncome)}
            </div>
            <div className="text-sm text-green-600">
              {incomeTransactions.length} transação{incomeTransactions.length !== 1 ? 'ões' : ''}
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-red-50 to-rose-50 p-4 rounded-xl border border-red-100">
            <div className="flex items-center gap-3 mb-2">
              <ArrowDownCircle className="text-red-600" size={20} />
              <span className="text-red-800 font-medium">Gastos</span>
            </div>
            <div className="text-xl font-bold text-red-900">
              {formatCurrency(totalExpense)}
            </div>
            <div className="text-sm text-red-600">
              {expenseTransactions.length} transação{expenseTransactions.length !== 1 ? 'ões' : ''}
            </div>
          </div>
          
          <div className={`bg-gradient-to-br p-4 rounded-xl border ${
            netChange >= 0 
              ? 'from-blue-50 to-indigo-50 border-blue-100' 
              : 'from-orange-50 to-yellow-50 border-orange-100'
          }`}>
            <div className="flex items-center gap-3 mb-2">
              {netChange >= 0 ? (
                <TrendingUp className="text-blue-600" size={20} />
              ) : (
                <TrendingDown className="text-orange-600" size={20} />
              )}
              <span className={`font-medium ${netChange >= 0 ? 'text-blue-800' : 'text-orange-800'}`}>
                Resultado
              </span>
            </div>
            <div className={`text-xl font-bold ${netChange >= 0 ? 'text-blue-900' : 'text-orange-900'}`}>
              {formatCurrency(Math.abs(netChange))}
            </div>
            <div className={`text-sm ${netChange >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
              {netChange >= 0 ? 'Positivo' : 'Negativo'}
            </div>
          </div>
        </div>
        
        {/* Transactions List */}
        {transactions.length > 0 ? (
          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Transações do Dia ({transactions.length})
            </h4>
            
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {transactions.map((transaction) => (
                <motion.div
                  key={transaction.id}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                    transaction.type === 'income'
                      ? 'bg-green-50 border-green-200 hover:bg-green-100'
                      : 'bg-red-50 border-red-200 hover:bg-red-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {transaction.type === 'income' ? (
                      <ArrowUpCircle className="text-green-600" size={20} />
                    ) : (
                      <ArrowDownCircle className="text-red-600" size={20} />
                    )}
                    
                    <div>
                      <div className="font-medium text-gray-900">
                        {transaction.description}
                      </div>
                      <div className="text-sm text-gray-600">
                        {transaction.category}
                      </div>
                    </div>
                  </div>
                  
                  <div className={`font-bold ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            <p>Nenhuma transação neste dia</p>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};