import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Transaction, DailyBalance } from './types';
import { calculateDailyBalances } from './utils/financialCalculations';
import { useTransactions } from './hooks/useTransactions';
import { useCategories } from './hooks/useCategories';
import { Header } from './components/Header/Header';
import { Timeline } from './components/Timeline/Timeline';
import { TransactionDetails } from './components/TransactionDetails/TransactionDetails';
import { AddTransactionForm } from './components/AddTransaction/AddTransactionForm';
import { CategoryManagement } from './components/CategoryManagement/CategoryManagement';

function App() {
  // Hooks para gerenciar dados
  const { 
    transactions, 
    loading: transactionsLoading, 
    error: transactionsError,
    addTransaction: addTransactionAPI 
  } = useTransactions();
  
  const { 
    categories, 
    loading: categoriesLoading, 
    error: categoriesError,
    addCategory,
    updateCategory,
    deleteCategory
  } = useCategories();
  
  // Estados locais
  const [selectedDailyBalance, setSelectedDailyBalance] = useState<DailyBalance | null>(null);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'dashboard' | 'categories'>('dashboard');
  
  // Calculate daily balances
  const dailyBalances = useMemo(() => {
    return calculateDailyBalances(transactions, 5000); // Starting balance of R$ 5000
  }, [transactions]);
  
  // Calculate summary stats
  const summaryStats = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });
    
    const monthlyIncome = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const monthlyExpense = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalBalance = dailyBalances.length > 0 
      ? dailyBalances[dailyBalances.length - 1].balance 
      : 5000;
    
    return {
      totalBalance,
      monthlyIncome,
      monthlyExpense,
    };
  }, [transactions, dailyBalances]);
  
  const handleAddTransaction = async (transactionData: Omit<Transaction, 'id' | 'createdAt'>) => {
    try {
      await addTransactionAPI(transactionData);
      setIsAddFormOpen(false);
    } catch (error) {
      console.error('Erro ao adicionar transação:', error);
      // Aqui você pode adicionar um toast de erro se desejar
    }
  };
  
  const handleUpdateCategories = async (categoryData: any, categoryId?: string) => {
    try {
      if (categoryId) {
        await updateCategory(categoryId, categoryData);
      } else {
        await addCategory(categoryData);
      }
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
    }
  };
  
  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await deleteCategory(categoryId);
    } catch (error) {
      console.error('Erro ao deletar categoria:', error);
    }
  };
  
  // Loading state
  if (transactionsLoading || categoriesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados...</p>
        </div>
      </div>
    );
  }
  
  // Error state
  if (transactionsError || categoriesError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erro de Conexão</h2>
          <p className="text-gray-600 mb-4">
            {transactionsError || categoriesError}
          </p>
          <p className="text-sm text-gray-500">
            Verifique se o servidor backend está rodando na porta 3001
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }
  
  if (currentView === 'categories') {
    return (
      <CategoryManagement
        categories={categories}
        onUpdateCategories={handleUpdateCategories}
        onDeleteCategory={handleDeleteCategory}
        onBack={() => setCurrentView('dashboard')}
      />
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <Header
            {...summaryStats}
            onAddTransaction={() => setIsAddFormOpen(true)}
            onManageCategories={() => setCurrentView('categories')}
          />
          
          {/* Timeline */}
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Timeline
              dailyBalances={dailyBalances}
              onPointSelect={setSelectedDailyBalance}
            />
          </motion.div>
          
          {/* Transaction Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <TransactionDetails dailyBalance={selectedDailyBalance} />
          </motion.div>
        </motion.div>
        
        {/* Add Transaction Form */}
        <AnimatePresence>
          {isAddFormOpen && (
            <AddTransactionForm
              categories={categories}
              onAddTransaction={handleAddTransaction}
              isOpen={isAddFormOpen}
              onClose={() => setIsAddFormOpen(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;