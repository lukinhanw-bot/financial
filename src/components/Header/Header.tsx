import React from 'react';
import { motion } from 'framer-motion';
import { Wallet, Plus, BarChart3, TrendingUp, Settings } from 'lucide-react';
import { formatCurrency } from '../../utils/financialCalculations';

interface HeaderProps {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  onAddTransaction: () => void;
  onManageCategories: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  totalBalance,
  monthlyIncome,
  monthlyExpense,
  onAddTransaction,
  onManageCategories,
}) => {
  const monthlyNet = monthlyIncome - monthlyExpense;
  
  return (
    <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 text-white p-6 rounded-2xl shadow-xl mb-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            <Wallet size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Financial Dashboard</h1>
            <p className="text-blue-100">Controle suas finanças com inteligência</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <motion.button
            onClick={onManageCategories}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-xl transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Settings size={20} />
            Categorias
          </motion.button>
          
          <motion.button
            onClick={onAddTransaction}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-xl transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus size={20} />
            Nova Transação
          </motion.button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <Wallet className="text-blue-200" size={20} />
            <span className="text-blue-100 text-sm">Saldo Total</span>
          </div>
          <div className="text-2xl font-bold">
            {formatCurrency(totalBalance)}
          </div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="text-green-200" size={20} />
            <span className="text-green-100 text-sm">Receitas do Mês</span>
          </div>
          <div className="text-2xl font-bold text-green-200">
            {formatCurrency(monthlyIncome)}
          </div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="text-red-200" size={20} />
            <span className="text-red-100 text-sm">Gastos do Mês</span>
          </div>
          <div className="text-2xl font-bold text-red-200">
            {formatCurrency(monthlyExpense)}
          </div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className={monthlyNet >= 0 ? "text-green-200" : "text-yellow-200"} size={20} />
            <span className={`text-sm ${monthlyNet >= 0 ? "text-green-100" : "text-yellow-100"}`}>
              Resultado Mensal
            </span>
          </div>
          <div className={`text-2xl font-bold ${monthlyNet >= 0 ? "text-green-200" : "text-yellow-200"}`}>
            {monthlyNet >= 0 ? "+" : ""}{formatCurrency(monthlyNet)}
          </div>
        </div>
      </div>
    </div>
  );
};