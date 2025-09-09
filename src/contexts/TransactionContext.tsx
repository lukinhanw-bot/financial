import React, { createContext, useContext, ReactNode } from 'react';
import { useTransactions } from '../hooks/useTransactions';

interface TransactionContextType {
  transactions: any[];
  loading: boolean;
  error: string | null;
  addTransaction: (transactionData: any) => Promise<void>;
  editTransaction: (id: string, transactionData: any) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  deleteRecurringTransaction: (id: string) => Promise<void>;
  deleteForwardTransaction: (id: string) => Promise<any>;
  refetch: () => Promise<void>;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

interface TransactionProviderProps {
  children: ReactNode;
  userId?: string;
}

export const TransactionProvider: React.FC<TransactionProviderProps> = ({ 
  children, 
  userId = 'default' 
}) => {
  const transactionData = useTransactions(userId);

  return (
    <TransactionContext.Provider value={transactionData}>
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactionContext = () => {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error('useTransactionContext must be used within a TransactionProvider');
  }
  return context;
};
