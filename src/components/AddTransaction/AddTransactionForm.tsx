import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Transaction, Category } from '../../types';
import { Plus, Tag, FileText, X } from 'lucide-react';
import { CustomSelect } from '../UI/CustomSelect';
import { CurrencyInput } from '../UI/CurrencyInput';
import { DateInput } from '../UI/DateInput';

interface AddTransactionFormProps {
  categories: Category[];
  onAddTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const AddTransactionForm: React.FC<AddTransactionFormProps> = ({
  categories,
  onAddTransaction,
  isOpen,
  onClose,
}) => {
  const [formData, setFormData] = useState({
    type: 'expense' as 'income' | 'expense',
    amount: '',
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
  });
  
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
    });
    
    setFormData({
      type: 'expense',
      amount: '',
      description: '',
      category: '',
      date: new Date().toISOString().split('T')[0],
    });
    
    onClose();
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
        className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Plus className="text-blue-600" size={20} />
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              Nova Transação
            </h3>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type Selection */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'income', category: '' })}
              className={`p-3 rounded-lg border-2 transition-all ${
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
              className={`p-3 rounded-lg border-2 transition-all ${
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              💰 
              Valor
            </label>
            <CurrencyInput
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="R$ 0,00"
            />
          </div>
          
          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText size={16} className="inline mr-1" />
              Descrição
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Ex: Almoço no restaurante"
              required
            />
          </div>
          
          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Tag size={16} className="inline mr-1" />
              Categoria
            </label>
            <CustomSelect
              options={categoryOptions}
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="Selecione uma categoria"
            />
          </div>
          
          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📅 
              Data
            </label>
            <DateInput
              value={formData.date}
              onChange={(value) => setFormData({ ...formData, date: value })}
            />
          </div>
          
          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            
            <button
              type="submit"
              className={`flex-1 p-3 rounded-lg text-white font-medium transition-colors ${
                formData.type === 'income'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              Adicionar
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};