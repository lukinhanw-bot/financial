import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Category } from '../../types';
import { Save, X, Palette } from 'lucide-react';

interface CategoryFormProps {
  category?: Category;
  isOpen: boolean;
  onSave: (category: Omit<Category, 'id'>) => void;
  onClose: () => void;
}

const iconOptions = [
  { value: 'Briefcase', label: '💼 Trabalho', emoji: '💼' },
  { value: 'Code', label: '💻 Freelancer', emoji: '💻' },
  { value: 'ShoppingBag', label: '🛍️ Vendas', emoji: '🛍️' },
  { value: 'TrendingUp', label: '📈 Investimentos', emoji: '📈' },
  { value: 'UtensilsCrossed', label: '🍽️ Alimentação', emoji: '🍽️' },
  { value: 'Car', label: '🚗 Transporte', emoji: '🚗' },
  { value: 'Home', label: '🏠 Moradia', emoji: '🏠' },
  { value: 'Gamepad2', label: '🎮 Entretenimento', emoji: '🎮' },
  { value: 'Heart', label: '❤️ Saúde', emoji: '❤️' },
  { value: 'ShoppingCart', label: '🛒 Compras', emoji: '🛒' },
];

const colorOptions = [
  '#10B981', '#059669', '#0D9488', '#0F766E', // Greens for income
  '#EF4444', '#DC2626', '#B91C1C', '#991B1B', '#7F1D1D', // Reds for expenses
  '#F59E0B', '#D97706', '#B45309', // Oranges
  '#3B82F6', '#2563EB', '#1D4ED8', // Blues
  '#8B5CF6', '#7C3AED', '#6D28D9', // Purples
];

export const CategoryForm: React.FC<CategoryFormProps> = ({
  category,
  isOpen,
  onSave,
  onClose,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    icon: 'Briefcase',
    color: '#10B981',
    type: 'expense' as 'income' | 'expense',
  });

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        icon: category.icon,
        color: category.color,
        type: category.type,
      });
    } else {
      setFormData({
        name: '',
        icon: 'Briefcase',
        color: '#10B981',
        type: 'expense',
      });
    }
  }, [category, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      return;
    }

    onSave(formData);
    onClose();
  };

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
            <div className="p-2 bg-purple-100 rounded-lg">
              <Save className="text-purple-600" size={20} />
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              {category ? 'Editar Categoria' : 'Nova Categoria'}
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'income' })}
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
                onClick={() => setFormData({ ...formData, type: 'expense' })}
                className={`p-3 rounded-lg border-2 transition-all ${
                  formData.type === 'expense'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-200 hover:border-red-300'
                }`}
              >
                💸 Gasto
              </button>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome da Categoria
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
              placeholder="Ex: Alimentação"
              required
            />
          </div>

          {/* Icon Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ícone
            </label>
            <div className="grid grid-cols-5 gap-2">
              {iconOptions.map((icon) => (
                <button
                  key={icon.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, icon: icon.value })}
                  className={`p-3 rounded-lg border-2 transition-all text-2xl ${
                    formData.icon === icon.value
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                  title={icon.label}
                >
                  {icon.emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Palette size={16} className="inline mr-1" />
              Cor
            </label>
            <div className="grid grid-cols-8 gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className={`w-8 h-8 rounded-lg border-2 transition-all ${
                    formData.color === color
                      ? 'border-gray-800 scale-110'
                      : 'border-gray-300 hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preview
            </label>
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: formData.color }}
              >
                {iconOptions.find(icon => icon.value === formData.icon)?.emoji || '💰'}
              </div>
              <div>
                <div className="font-semibold text-gray-900">
                  {formData.name || 'Nome da categoria'}
                </div>
                <div className="text-sm text-gray-500 capitalize">
                  {formData.type === 'income' ? 'Receita' : 'Gasto'}
                </div>
              </div>
            </div>
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
              className="flex-1 p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
            >
              {category ? 'Atualizar' : 'Criar'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};