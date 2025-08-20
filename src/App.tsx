import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Transaction, DailyBalance, Category } from './types';
import { generateMockTransactions, categories } from './utils/mockData';
import { calculateDailyBalances } from './utils/financialCalculations';
import { Header } from './components/Header/Header';
import { Timeline } from './components/Timeline/Timeline';
import { TransactionDetails } from './components/TransactionDetails/TransactionDetails';
import { AddTransactionForm } from './components/AddTransaction/AddTransactionForm';
import { CategoryManagement } from './components/CategoryManagement/CategoryManagement';

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>(() => generateMockTransactions());
  const [categoriesState, setCategoriesState] = useState<Category[]>(categories);
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
  
  const handleAddTransaction = (transactionData: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTransaction: Transaction = {
      ...transactionData,
      id: `${transactionData.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };
    
    setTransactions(prev => [...prev, newTransaction].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    ));
  };
  
  const handleUpdateCategories = (newCategories: Category[]) => {
    setCategoriesState(newCategories);
  };
  
  if (currentView === 'categories') {
    return (
      <CategoryManagement
        categories={categoriesState}
        onUpdateCategories={handleUpdateCategories}
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
              categories={categoriesState}
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