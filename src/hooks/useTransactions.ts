import { useState, useEffect, useCallback } from 'react';
import { Transaction } from '../types';
import { transactionService } from '../services/api';

export const useTransactions = (userId = 'default') => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar transações
  const loadTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await transactionService.getAll(userId);
      setTransactions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar transações');
      console.error('Erro ao carregar transações:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Adicionar transação
  const addTransaction = useCallback(async (transactionData: Omit<Transaction, 'id' | 'createdAt'>) => {
    try {
      setError(null);
      const newTransaction = await transactionService.create(transactionData, userId);
      setTransactions(prev => [...prev, newTransaction].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      ));
      return newTransaction;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao adicionar transação';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [userId]);

  // Atualizar transação
  const updateTransaction = useCallback(async (id: string, transactionData: Partial<Transaction>) => {
    try {
      setError(null);
      const updatedTransaction = await transactionService.update(id, transactionData, userId);
      setTransactions(prev => prev.map(t => t.id === id ? updatedTransaction : t));
      return updatedTransaction;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar transação';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [userId]);

  // Deletar transação
  const deleteTransaction = useCallback(async (id: string) => {
    try {
      setError(null);
      await transactionService.delete(id, userId);
      setTransactions(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao deletar transação';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [userId]);

  // Gerar transações recorrentes
  const generateRecurringTransactions = useCallback(async () => {
    try {
      setError(null);
      const result = await transactionService.generateRecurring(userId);
      if (result.transactions && result.transactions.length > 0) {
        // Recarregar transações para incluir as novas geradas
        await loadTransactions();
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao gerar transações recorrentes';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [userId, loadTransactions]);

  // Editar transação
  const editTransaction = useCallback(async (id: string, transactionData: Partial<Transaction>) => {
    try {
      setError(null);
      const updatedTransaction = await transactionService.update(id, transactionData, userId);
      setTransactions(prev => prev.map(t => t.id === id ? updatedTransaction : t));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao editar transação';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [userId]);

  // Deletar transação recorrente e todas suas instâncias
  const deleteRecurringTransaction = useCallback(async (id: string) => {
    try {
      setError(null);
      await transactionService.deleteRecurring(id, userId);
      // Recarregar transações para remover todas as instâncias
      await loadTransactions();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao deletar transação recorrente';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [userId, loadTransactions]);

  // Carregar transações na inicialização
  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  return {
    transactions,
    loading,
    error,
    addTransaction,
    editTransaction,
    updateTransaction,
    deleteTransaction,
    generateRecurringTransactions,
    deleteRecurringTransaction,
    refetch: loadTransactions,
  };
};