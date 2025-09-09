import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (deleteType: 'single' | 'all' | 'forward') => void;
  transactionDescription: string;
  isRecurring: boolean;
  hasSubsequentInstances?: boolean;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  transactionDescription,
  isRecurring,
  hasSubsequentInstances = false,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          className="bg-white rounded-2xl w-full max-w-md shadow-2xl"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 p-6 pb-4 border-b border-gray-100">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle size={20} className="text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Confirmar Exclusão
              </h3>
              <p className="text-sm text-gray-600">
                O que você deseja fazer com esta transação?
              </p>
            </div>
            <button
              onClick={onClose}
              className="ml-auto p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={18} className="text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="mb-4">
              <p className="text-gray-700 mb-2">
                <strong>Transação:</strong> {transactionDescription}
              </p>
              {isRecurring && (
                <p className="text-sm text-blue-600 bg-blue-50 p-2 rounded-lg">
                  <strong>Conta Fixa:</strong> Esta é uma transação recorrente
                </p>
              )}
            </div>

            <div className="space-y-3">
              {/* Delete only current */}
              <button
                onClick={() => onConfirm('single')}
                className="w-full flex items-center gap-3 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <Trash2 size={18} className="text-gray-600" />
                <div>
                  <div className="font-medium text-gray-900">
                    Deletar apenas esta transação
                  </div>
                  <div className="text-sm text-gray-600">
                    Remove apenas esta instância
                  </div>
                </div>
              </button>

              {/* Delete forward - only show if there are subsequent instances */}
              {hasSubsequentInstances && (
                <button
                  onClick={() => onConfirm('forward')}
                  className="w-full flex items-center gap-3 p-3 border border-orange-300 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors text-left"
                >
                  <Trash2 size={18} className="text-orange-600" />
                  <div>
                    <div className="font-medium text-orange-900">
                      Deletar para frente
                    </div>
                    <div className="text-sm text-orange-700">
                      Remove esta e todas as instâncias subsequentes
                    </div>
                  </div>
                </button>
              )}

              {/* Delete all recurring */}
              {isRecurring && (
                <button
                  onClick={() => onConfirm('all')}
                  className="w-full flex items-center gap-3 p-3 border border-red-300 bg-red-50 rounded-lg hover:bg-red-100 transition-colors text-left"
                >
                  <Trash2 size={18} className="text-red-600" />
                  <div>
                    <div className="font-medium text-red-900">
                      Deletar todas as transações recorrentes
                    </div>
                    <div className="text-sm text-red-700">
                      Remove esta e todas as futuras instâncias
                    </div>
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 p-6 pt-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 font-medium"
            >
              Cancelar
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
