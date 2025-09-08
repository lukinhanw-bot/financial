import { useState, useEffect, useCallback } from 'react';
import { settingsService } from '../services/api';

interface Settings {
  id?: string;
  user_id?: string;
  initial_balance: number;
  created_at?: string;
  updated_at?: string;
}

const DEFAULT_SETTINGS: Settings = {
  initial_balance: 0,
};

export const useSettings = (userId = 'default') => {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar configurações do backend
  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await settingsService.get(userId);
      setSettings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar configurações');
      console.error('Erro ao carregar configurações:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Atualizar saldo inicial
  const updateInitialBalance = useCallback(async (balance: number) => {
    try {
      setError(null);
      const updatedSettings = await settingsService.update({ initial_balance: balance }, userId);
      setSettings(updatedSettings);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar configurações';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [userId]);

  // Resetar configurações
  const resetSettings = useCallback(async () => {
    try {
      setError(null);
      const resetData = await settingsService.reset(userId);
      setSettings(resetData.settings);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao resetar configurações';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [userId]);

  // Carregar configurações na inicialização
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return {
    settings,
    loading,
    error,
    updateInitialBalance,
    resetSettings,
    refetch: loadSettings,
    initialBalance: settings.initial_balance,
  };
};
