import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Transaction, DailyBalance } from './types';
import { calculateDailyBalances } from './utils/financialCalculations';
import { TransactionProvider, useTransactionContext } from './contexts/TransactionContext';
import { useCategories } from './hooks/useCategories';
import { useSettings } from './hooks/useSettings';
import { Header } from './components/Header/Header';
import { Timeline } from './components/Timeline/Timeline';
import { TransactionDetails } from './components/TransactionDetails/TransactionDetails';
import { AddTransactionForm } from './components/AddTransaction/AddTransactionForm';
import { CategoryManagement } from './components/CategoryManagement/CategoryManagement';
import { TransactionManagement } from './components/TransactionManagement/TransactionManagement';
import { Settings } from './components/Settings/Settings';

function AppContent() {
  // Hooks para gerenciar dados
  const { 
    transactions, 
    loading: transactionsLoading, 
    error: transactionsError,
    addTransaction: addTransactionAPI,
    deleteTransaction: deleteTransactionAPI,
    deleteRecurringTransaction: deleteRecurringTransactionAPI,
    generateRecurringTransactions,
    refetch: refetchTransactions
  } = useTransactionContext();
  
  const { 
    categories, 
    loading: categoriesLoading, 
    error: categoriesError,
    addCategory,
    updateCategory,
    deleteCategory
  } = useCategories();
  
  const { 
    initialBalance, 
    updateInitialBalance,
    loading: settingsLoading
  } = useSettings();
  
  // Estados locais
  const [selectedDailyBalance, setSelectedDailyBalance] = useState<DailyBalance | null>(null);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'dashboard' | 'categories' | 'transactions'>('dashboard');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  // Filter transactions by selected month
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === selectedMonth && date.getFullYear() === selectedYear;
    });
  }, [transactions, selectedMonth, selectedYear]);

  // Calculate daily balances
  const dailyBalances = useMemo(() => {
    // Só calcula se as configurações já foram carregadas
    if (settingsLoading) {
      return []; // Retorna array vazio enquanto carrega
    }
    
    return calculateDailyBalances(filteredTransactions, initialBalance);
  }, [filteredTransactions, initialBalance, settingsLoading]);
  
  // Calculate summary stats
  const summaryStats = useMemo(() => {
    const monthlyIncome = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const monthlyExpense = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalBalance = dailyBalances.length > 0 
      ? dailyBalances[dailyBalances.length - 1].balance 
      : initialBalance;
    
    return {
      totalBalance,
      monthlyIncome,
      monthlyExpense,
    };
  }, [filteredTransactions, dailyBalances, initialBalance]);
  
  const handleAddTransaction = async (transactionData: Omit<Transaction, 'id' | 'createdAt'>) => {
    try {
      await addTransactionAPI(transactionData);
      setIsAddFormOpen(false);
      // Recarregar dados após adicionar transação
      await refetchTransactions();
    } catch (error) {
      console.error('Erro ao adicionar transação:', error);
      // Aqui você pode adicionar um toast de erro se desejar
    }
  };

  // Handle deleting transaction
  const handleDeleteTransaction = async (transactionId: string) => {
    try {
      // Recarregar dados após deletar transação
      await refetchTransactions();
      
      // Atualizar selectedDailyBalance se necessário
      if (selectedDailyBalance) {
        const updatedTransactions = selectedDailyBalance.transactions.filter(t => t.id !== transactionId);
        if (updatedTransactions.length === 0) {
          setSelectedDailyBalance(null);
        } else {
          setSelectedDailyBalance({
            ...selectedDailyBalance,
            transactions: updatedTransactions
          });
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar após deletar transação:', error);
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

  // Handle settings update
  const handleBalanceChange = async (newBalance: number) => {
    await updateInitialBalance(newBalance);
  };
  
  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await deleteCategory(categoryId);
    } catch (error) {
      console.error('Erro ao deletar categoria:', error);
    }
  };

  // Handle month change
  const handleMonthChange = (month: number, year: number) => {
    setSelectedMonth(month);
    setSelectedYear(year);
    setSelectedDailyBalance(null); // Clear selected daily balance when changing month
  };

  // Gerar transações recorrentes automaticamente ao carregar o app
  useEffect(() => {
    if (!transactionsLoading && !settingsLoading) {
      generateRecurringTransactions().catch(error => {
        console.error('Erro ao gerar transações recorrentes:', error);
      });
    }
  }, [transactionsLoading, settingsLoading, generateRecurringTransactions]);
  
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
  
  if (currentView === 'transactions') {
    return (
      <TransactionManagement
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
            currentMonth={selectedMonth}
            currentYear={selectedYear}
            onAddTransaction={() => setIsAddFormOpen(true)}
            onManageCategories={() => setCurrentView('categories')}
            onManageTransactions={() => setCurrentView('transactions')}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onMonthChange={handleMonthChange}
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
            <TransactionDetails 
              dailyBalance={selectedDailyBalance} 
              onTransactionDelete={handleDeleteTransaction}
            />
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
        
        {/* Settings Modal */}
        <Settings
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          initialBalance={initialBalance}
          onBalanceChange={handleBalanceChange}
        />
      </div>
    </div>
  );
}

function App() {
  return (
    <TransactionProvider>
      <AppContent />
    </TransactionProvider>
  );
}

export default App;