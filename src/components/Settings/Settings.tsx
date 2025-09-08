import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings as SettingsIcon, Save, RefreshCw, DollarSign } from 'lucide-react';
import { CurrencyInput } from '../UI/CurrencyInput';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  initialBalance: number;
  onBalanceChange: (balance: number) => Promise<void>;
}

export const Settings: React.FC<SettingsProps> = ({
  isOpen,
  onClose,
  initialBalance,
  onBalanceChange
}) => {
  const [balance, setBalance] = useState(initialBalance.toString());
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setBalance(initialBalance.toString());
  }, [initialBalance]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const newBalance = parseFloat(balance);
      if (!isNaN(newBalance) && newBalance >= 0) {
        await onBalanceChange(newBalance);
        onClose();
      } else {
        alert('Por favor, insira um valor válido para o saldo inicial');
      }
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      alert(`Erro ao salvar configurações: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setBalance('0');
  };

  const handleCancel = () => {
    setBalance(initialBalance.toString());
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-full">
                <SettingsIcon className="text-blue-600" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Configurações</h2>
                <p className="text-gray-600">Gerencie suas preferências</p>
              </div>
            </div>

            {/* Settings Form */}
            <div className="space-y-6">
              {/* Initial Balance */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <DollarSign size={16} className="inline mr-1" />
                  Saldo Inicial
                </label>
                <div className="space-y-2">
                  <CurrencyInput
                    value={balance}
                    onChange={setBalance}
                    placeholder="R$ 0,00"
                    className="text-lg"
                  />
                  <p className="text-sm text-gray-500">
                    Este valor será usado como base para calcular o saldo total
                  </p>
                </div>
              </div>

              {/* Info Card */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">💡 Dica</h3>
                <p className="text-sm text-blue-800">
                  O saldo inicial é usado para calcular o saldo total considerando todas as suas transações. 
                  Você pode ajustar este valor a qualquer momento.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-8">
              <button
                onClick={handleReset}
                className="flex-1 px-4 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw size={16} />
                Resetar
              </button>
              
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Salvar
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
