import { useState, useEffect, useCallback } from 'react';
import { Category } from '../types';
import { categoryService } from '../services/api';

export const useCategories = (userId = 'default') => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar categorias
  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await categoryService.getAll(userId);
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar categorias');
      console.error('Erro ao carregar categorias:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Adicionar categoria
  const addCategory = useCallback(async (categoryData: Omit<Category, 'id'>) => {
    try {
      setError(null);
      const newCategory = await categoryService.create(categoryData, userId);
      setCategories(prev => [...prev, newCategory]);
      return newCategory;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao adicionar categoria';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [userId]);

  // Atualizar categoria
  const updateCategory = useCallback(async (id: string, categoryData: Partial<Category>) => {
    try {
      setError(null);
      const updatedCategory = await categoryService.update(id, categoryData, userId);
      setCategories(prev => prev.map(c => c.id === id ? updatedCategory : c));
      return updatedCategory;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar categoria';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [userId]);

  // Deletar categoria
  const deleteCategory = useCallback(async (id: string) => {
    try {
      setError(null);
      await categoryService.delete(id, userId);
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao deletar categoria';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [userId]);

  // Carregar categorias na inicialização
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  return {
    categories,
    loading,
    error,
    addCategory,
    updateCategory,
    deleteCategory,
    refetch: loadCategories,
  };
};