import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Category } from '../../types';
import { CategoryList } from './CategoryList';
import { CategoryForm } from './CategoryForm';
import { ArrowLeft } from 'lucide-react';

interface CategoryManagementProps {
  categories: Category[];
  onUpdateCategories: (categories: Category[]) => void;
  onBack: () => void;
}

export const CategoryManagement: React.FC<CategoryManagementProps> = ({
  categories,
  onUpdateCategories,
  onBack,
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>();

  const handleSaveCategory = (categoryData: Omit<Category, 'id'>) => {
    if (editingCategory) {
      // Update existing category
      const updatedCategories = categories.map(cat =>
        cat.id === editingCategory.id
          ? { ...categoryData, id: editingCategory.id }
          : cat
      );
      onUpdateCategories(updatedCategories);
    } else {
      // Create new category
      const newCategory: Category = {
        ...categoryData,
        id: `cat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      };
      onUpdateCategories([...categories, newCategory]);
    }
    
    setIsFormOpen(false);
    setEditingCategory(undefined);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  const handleDeleteCategory = (categoryId: string) => {
    const updatedCategories = categories.filter(cat => cat.id !== categoryId);
    onUpdateCategories(updatedCategories);
  };

  const handleAddCategory = () => {
    setEditingCategory(undefined);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingCategory(undefined);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-blue-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Back Button */}
          <motion.button
            onClick={onBack}
            className="flex items-center gap-2 mb-6 text-gray-600 hover:text-gray-900 transition-colors"
            whileHover={{ x: -5 }}
          >
            <ArrowLeft size={20} />
            Voltar ao Dashboard
          </motion.button>

          {/* Category List */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <CategoryList
              categories={categories}
              onEdit={handleEditCategory}
              onDelete={handleDeleteCategory}
              onAdd={handleAddCategory}
            />
          </div>
        </motion.div>

        {/* Category Form Modal */}
        <AnimatePresence>
          {isFormOpen && (
            <CategoryForm
              category={editingCategory}
              isOpen={isFormOpen}
              onSave={handleSaveCategory}
              onClose={handleCloseForm}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};