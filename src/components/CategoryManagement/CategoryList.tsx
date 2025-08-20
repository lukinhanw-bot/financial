import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Category } from '../../types';
import { Edit, Trash2, Plus, Tag } from 'lucide-react';

interface CategoryListProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (categoryId: string) => void;
  onAdd: () => void;
}

export const CategoryList: React.FC<CategoryListProps> = ({
  categories,
  onEdit,
  onDelete,
  onAdd,
}) => {
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const incomeCategories = categories.filter(cat => cat.type === 'income');
  const expenseCategories = categories.filter(cat => cat.type === 'expense');

  const handleDelete = (categoryId: string) => {
    onDelete(categoryId);
    setDeleteConfirm(null);
  };

  const CategoryCard: React.FC<{ category: Category }> = ({ category }) => (
    <motion.div
      className="bg-white rounded-xl p-4 shadow-md border border-gray-100 hover:shadow-lg transition-all"
      whileHover={{ y: -2 }}
      layout
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
            style={{ backgroundColor: category.color }}
          >
            {category.icon === 'UtensilsCrossed' ? '🍽️' : 
             category.icon === 'Car' ? '🚗' : 
             category.icon === 'Home' ? '🏠' : 
             category.icon === 'Gamepad2' ? '🎮' : 
             category.icon === 'Heart' ? '❤️' : 
             category.icon === 'ShoppingCart' ? '🛒' : 
             category.icon === 'Briefcase' ? '💼' : 
             category.icon === 'Code' ? '💻' : 
             category.icon === 'ShoppingBag' ? '🛍️' : 
             category.icon === 'TrendingUp' ? '📈' : '💰'}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{category.name}</h3>
            <p className="text-sm text-gray-500 capitalize">{category.type === 'income' ? 'Receita' : 'Gasto'}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(category)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Edit size={16} />
          </button>
          
          {deleteConfirm === category.id ? (
            <div className="flex gap-1">
              <button
                onClick={() => handleDelete(category.id)}
                className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
              >
                Confirmar
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-3 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400 transition-colors"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <button
              onClick={() => setDeleteConfirm(category.id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-100 rounded-xl">
            <Tag className="text-purple-600" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gerenciar Categorias</h1>
            <p className="text-gray-600">Organize suas receitas e gastos</p>
          </div>
        </div>
        
        <motion.button
          onClick={onAdd}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus size={20} />
          Nova Categoria
        </motion.button>
      </div>

      {/* Income Categories */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-4 h-4 bg-green-500 rounded-full"></span>
          Receitas ({incomeCategories.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {incomeCategories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Expense Categories */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-4 h-4 bg-red-500 rounded-full"></span>
          Gastos ({expenseCategories.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {expenseCategories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};