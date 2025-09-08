import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DailyBalance } from '../../types';
import { formatCurrency, formatDate } from '../../utils/financialCalculations';
import { ArrowUpCircle, ArrowDownCircle, Calendar, TrendingUp, TrendingDown, Trash2, X, Repeat } from 'lucide-react';
import { useTransactionContext } from '../../contexts/TransactionContext';
import { DeleteConfirmationModal } from '../UI/DeleteConfirmationModal';

interface TransactionDetailsProps {
  dailyBalance: DailyBalance | null;
  onTransactionDelete?: (transactionId: string) => void;
}

export const TransactionDetails: React.FC<TransactionDetailsProps> = ({ dailyBalance, onTransactionDelete }) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState<string | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const { deleteTransaction, deleteRecurringTransaction } = useTransactionContext();

  // Função para calcular quantas vezes uma transação recorrente vai se repetir
  const calculateRecurringCount = (transaction: any): number => {
    if (!transaction.is_recurring || !transaction.recurring_type || !transaction.recurring_interval) {
      return 1;
    }
    
    const startDate = new Date(transaction.date);
    const endDate = transaction.recurring_end_date ? new Date(transaction.recurring_end_date) : new Date(startDate.getTime() + (365 * 24 * 60 * 60 * 1000)); // 1 ano se não especificado
    
    let count = 1; // Conta a transação original
    let currentDate = new Date(startDate);
    
    while (currentDate < endDate) {
      switch (transaction.recurring_type) {
        case 'daily':
          currentDate.setDate(currentDate.getDate() + transaction.recurring_interval);
          break;
        case 'weekly':
          currentDate.setDate(currentDate.getDate() + (7 * transaction.recurring_interval));
          break;
        case 'monthly':
          currentDate.setMonth(currentDate.getMonth() + transaction.recurring_interval);
          break;
        case 'yearly':
          currentDate.setFullYear(currentDate.getFullYear() + transaction.recurring_interval);
          break;
        default:
          return 1;
      }
      
      if (currentDate <= endDate) {
        count++;
      }
    }
    
    return count;
  };

  const handleDeleteClick = (transaction: any) => {
    setSelectedTransaction(transaction);
    setShowConfirm(transaction.id);
  };

  const handleConfirmDelete = async (deleteAll: boolean) => {
    if (!selectedTransaction) return;
    
    setDeletingId(selectedTransaction.id);
    try {
      if (deleteAll && selectedTransaction.is_recurring) {
        // Deletar todas as transações recorrentes
        await deleteRecurringTransaction(selectedTransaction.parent_transaction_id || selectedTransaction.id);
      } else {
        // Deletar apenas a transação atual
        await deleteTransaction(selectedTransaction.id);
      }
      
      // Notificar o App para recarregar os dados
      onTransactionDelete?.(selectedTransaction.id);
      setShowConfirm(null);
      setSelectedTransaction(null);
    } catch (error) {
      console.error('Erro ao deletar transação:', error);
      alert(`Erro ao deletar transação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setDeletingId(null);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirm(null);
    setSelectedTransaction(null);
  };

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
                  className={`flex items-center justify-between p-3 rounded-lg border transition-colors group ${
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
                      <div className="font-medium text-gray-900 flex items-center gap-2">
                        {transaction.description}
                        {transaction.is_recurring && (
                          <Repeat size={14} className="text-blue-500" title="Transação recorrente" />
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        {transaction.category}
                        {transaction.is_recurring && (
                          <span className="ml-2 text-blue-600 font-medium">
                            (Conta Fixa)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className={`font-bold ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </div>
                    
                    {onTransactionDelete && (
                      <button
                        onClick={() => handleDeleteClick(transaction)}
                        disabled={deletingId === transaction.id}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-100 text-red-500 hover:text-red-700 disabled:opacity-50"
                        title="Deletar transação"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
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
      
      {/* Modal de Confirmação */}
      <DeleteConfirmationModal
        isOpen={!!showConfirm}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        transactionDescription={selectedTransaction?.description || ''}
        isRecurring={selectedTransaction?.is_recurring || false}
      />
    </AnimatePresence>
  );
};