import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Transaction, Category } from '../../types';
import { Plus, Tag, FileText, X } from 'lucide-react';
import { CustomSelect } from '../UI/CustomSelect';
import { CurrencyInput } from '../UI/CurrencyInput';
import { DateInput } from '../UI/DateInput';
import { RecurringToggle } from '../UI/RecurringToggle';

interface AddTransactionFormProps {
  categories: Category[];
  onAddTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
  isOpen: boolean;
  onClose: () => void;
  editingTransaction?: Transaction | null;
}

export const AddTransactionForm: React.FC<AddTransactionFormProps> = ({
  categories,
  onAddTransaction,
  isOpen,
  onClose,
  editingTransaction,
}) => {
  const getCurrentDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [formData, setFormData] = useState({
    type: 'expense' as 'income' | 'expense',
    amount: '',
    description: '',
    category: '',
    date: getCurrentDate(),
    is_recurring: false,
    recurring_type: 'monthly' as 'daily' | 'weekly' | 'monthly' | 'yearly',
    recurring_interval: 1,
    recurring_end_date: '',
    received: false,
  });
  
  const resetForm = () => {
    setFormData({
      type: 'expense' as 'income' | 'expense',
      amount: '',
      description: '',
      category: '',
      date: getCurrentDate(),
      is_recurring: false,
      recurring_type: 'monthly' as 'daily' | 'weekly' | 'monthly' | 'yearly',
      recurring_interval: 1,
      recurring_end_date: '',
      received: false,
    });
  };

  // Reset form when modal opens or when editing transaction changes
  useEffect(() => {
    if (isOpen) {
      if (editingTransaction) {
        // Preencher formulário com dados da transação sendo editada
        setFormData({
          type: editingTransaction.type,
          amount: editingTransaction.amount.toString(),
          description: editingTransaction.description,
          category: editingTransaction.category,
          date: editingTransaction.date,
          is_recurring: editingTransaction.is_recurring || false,
          recurring_type: editingTransaction.recurring_type || 'monthly',
          recurring_interval: editingTransaction.recurring_interval || 1,
          recurring_end_date: editingTransaction.recurring_end_date || '',
          received: editingTransaction.received || false,
        });
      } else {
        resetForm();
      }
    }
  }, [isOpen, editingTransaction]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.description || !formData.category) {
      return;
    }
    
    onAddTransaction({
      type: formData.type,
      amount: parseFloat(formData.amount),
      description: formData.description,
      category: formData.category,
      date: formData.date,
      is_recurring: formData.is_recurring,
      recurring_type: formData.is_recurring ? formData.recurring_type : undefined,
      recurring_interval: formData.is_recurring ? formData.recurring_interval : undefined,
      recurring_end_date: formData.is_recurring ? formData.recurring_end_date || undefined : undefined,
    });
    
    resetForm();
  };
  
  const filteredCategories = categories.filter(cat => cat.type === formData.type);
  
  const categoryOptions = filteredCategories.map(cat => ({
    value: cat.name,
    label: cat.name,
    icon: cat.icon === 'UtensilsCrossed' ? '🍽️' : 
          cat.icon === 'Car' ? '🚗' : 
          cat.icon === 'Home' ? '🏠' : 
          cat.icon === 'Gamepad2' ? '🎮' : 
          cat.icon === 'Heart' ? '❤️' : 
          cat.icon === 'ShoppingCart' ? '🛒' : 
          cat.icon === 'Briefcase' ? '💼' : 
          cat.icon === 'Code' ? '💻' : 
          cat.icon === 'ShoppingBag' ? '🛍️' : 
          cat.icon === 'TrendingUp' ? '📈' : '💰',
    color: cat.color,
  }));
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] flex flex-col"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Plus className="text-blue-600" size={20} />
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              {editingTransaction ? 'Editar Transação' : 'Nova Transação'}
            </h3>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 pt-4">
          <form id="transaction-form" onSubmit={handleSubmit} className="space-y-3">
          {/* Type Selection */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'income', category: '' })}
              className={`p-2.5 rounded-lg border-2 transition-all text-sm ${
                formData.type === 'income'
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 hover:border-green-300'
              }`}
            >
              💰 Receita
            </button>
            
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'expense', category: '' })}
              className={`p-2.5 rounded-lg border-2 transition-all text-sm ${
                formData.type === 'expense'
                  ? 'border-red-500 bg-red-50 text-red-700'
                  : 'border-gray-200 hover:border-red-300'
              }`}
            >
              💸 Gasto
            </button>
          </div>
          
          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              💰 
              Valor
            </label>
            <CurrencyInput
              value={formData.amount}
              onChange={(value) => setFormData({ ...formData, amount: value })}
              placeholder="R$ 0,00"
            />
          </div>
          
          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <FileText size={14} className="inline mr-1" />
              Descrição
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Ex: Almoço no restaurante"
              required
            />
          </div>
          
          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <Tag size={14} className="inline mr-1" />
              Categoria
            </label>
            <CustomSelect
              options={categoryOptions}
              value={formData.category}
              onChange={(value) => setFormData({ ...formData, category: value })}
              placeholder="Selecione uma categoria"
            />
          </div>
          
          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              📅 
              Data
            </label>
            <DateInput
              value={formData.date}
              onChange={(value) => setFormData({ ...formData, date: value })}
            />
          </div>

          {/* Received Checkbox - Only for Income */}
          {formData.type === 'income' && (
            <div>
              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.received}
                  onChange={(e) => setFormData({ ...formData, received: e.target.checked })}
                  className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                />
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✅</span>
                  <span className="text-sm font-medium text-gray-700">Recebido</span>
                </div>
              </label>
              <p className="text-xs text-gray-500 mt-1 ml-7">
                Marque se a receita já foi efetivamente recebida
              </p>
            </div>
          )}

          {/* Recurring Toggle */}
          <RecurringToggle
            isRecurring={formData.is_recurring}
            onToggle={(isRecurring) => setFormData({ ...formData, is_recurring: isRecurring })}
            recurringType={formData.recurring_type}
            onTypeChange={(type) => setFormData({ ...formData, recurring_type: type as any })}
            recurringInterval={formData.recurring_interval}
            onIntervalChange={(interval) => setFormData({ ...formData, recurring_interval: interval })}
            recurringEndDate={formData.recurring_end_date}
            onEndDateChange={(date) => setFormData({ ...formData, recurring_end_date: date })}
          />
          
          </form>
        </div>
        
        {/* Fixed Footer with Buttons */}
        <div className="border-t border-gray-100 p-4 bg-gray-50 rounded-b-2xl">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 p-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors bg-white text-sm font-medium"
            >
              Cancelar
            </button>
            
            <button
              type="submit"
              form="transaction-form"
              className={`flex-1 p-2.5 rounded-lg text-white font-medium transition-colors text-sm ${
                formData.type === 'income'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {editingTransaction ? 'Salvar Alterações' : 'Adicionar'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};