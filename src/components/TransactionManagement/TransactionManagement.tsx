import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Transaction, Category } from '../../types';
import { formatCurrency, formatDate } from '../../utils/financialCalculations';
import { 
  Search, 
  Filter, 
  Plus, 
  Edit2, 
  Trash2, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Calendar,
  Tag,
  DollarSign,
  CheckCircle,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useTransactionContext } from '../../contexts/TransactionContext';
import { useCategories } from '../../hooks/useCategories';
import { AddTransactionForm } from '../AddTransaction/AddTransactionForm';
import { DeleteConfirmationModal } from '../UI/DeleteConfirmationModal';

interface TransactionManagementProps {
  onBack: () => void;
}

export const TransactionManagement: React.FC<TransactionManagementProps> = ({ onBack }) => {
  const { 
    transactions, 
    loading: transactionsLoading, 
    addTransaction,
    editTransaction,
    deleteTransaction, 
    deleteRecurringTransaction,
    deleteForwardTransaction,
    refetch: refetchTransactions 
  } = useTransactionContext();
  
  const { categories } = useCategories();
  
  // Estados locais
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'description'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Estados para modais
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Filtrar e ordenar transações
  const filteredTransactions = useMemo(() => {
    let filtered = transactions.filter(transaction => {
      // Filtro de busca
      if (searchTerm && !transaction.description.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Filtro de tipo
      if (typeFilter !== 'all' && transaction.type !== typeFilter) {
        return false;
      }
      
      // Filtro de categoria
      if (categoryFilter !== 'all' && transaction.category !== categoryFilter) {
        return false;
      }
      
      // Filtro de data
      if (dateFilter) {
        const transactionDate = new Date(transaction.date).toISOString().split('T')[0];
        if (transactionDate !== dateFilter) {
          return false;
        }
      }
      
      return true;
    });
    
    // Ordenar
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'description':
          comparison = a.description.localeCompare(b.description);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    return filtered;
  }, [transactions, searchTerm, typeFilter, categoryFilter, dateFilter, sortBy, sortOrder]);
  
  // Paginação
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage);
  
  // Handlers
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };
  
  const handleFilterChange = (filterType: string, value: string) => {
    switch (filterType) {
      case 'type':
        setTypeFilter(value as 'all' | 'income' | 'expense');
        break;
      case 'category':
        setCategoryFilter(value);
        break;
      case 'date':
        setDateFilter(value);
        break;
    }
    setCurrentPage(1);
  };
  
  const handleSort = (field: 'date' | 'amount' | 'description') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };
  
  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsAddFormOpen(true);
  };
  
  const handleDelete = (transaction: Transaction) => {
    setDeletingTransaction(transaction);
    setShowDeleteModal(true);
  };
  
  const handleConfirmDelete = async (deleteType: 'single' | 'all' | 'forward') => {
    if (!deletingTransaction) return;
    
    try {
      switch (deleteType) {
        case 'single':
          await deleteTransaction(deletingTransaction.id);
          break;
        case 'all':
          if (deletingTransaction.is_recurring) {
            await deleteRecurringTransaction(deletingTransaction.parent_transaction_id || deletingTransaction.id);
          } else {
            await deleteTransaction(deletingTransaction.id);
          }
          break;
        case 'forward':
          await deleteForwardTransaction(deletingTransaction.id);
          break;
      }
      
      await refetchTransactions();
      setShowDeleteModal(false);
      setDeletingTransaction(null);
    } catch (error) {
      console.error('Erro ao deletar transação:', error);
    }
  };
  
  const handleAddTransaction = async (transactionData: Omit<Transaction, 'id' | 'createdAt'>) => {
    try {
      await refetchTransactions();
      setIsAddFormOpen(false);
      setEditingTransaction(null);
    } catch (error) {
      console.error('Erro ao adicionar transação:', error);
    }
  };

  const handleMarkAsReceived = async (transaction: Transaction) => {
    try {
      const updatedTransaction = { ...transaction, received: true };
      await editTransaction(transaction.id, updatedTransaction);
      await refetchTransactions();
    } catch (error) {
      console.error('Erro ao marcar como recebido:', error);
    }
  };

  const handleMarkAllReceived = async () => {
    try {
      const pendingIncomeTransactions = filteredTransactions.filter(
        t => t.type === 'income' && !t.received
      );
      
      for (const transaction of pendingIncomeTransactions) {
        await editTransaction(transaction.id, { ...transaction, received: true });
      }
      
      await refetchTransactions();
    } catch (error) {
      console.error('Erro ao marcar todas como recebidas:', error);
    }
  };
  
  const clearFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
    setCategoryFilter('all');
    setDateFilter('');
    setCurrentPage(1);
  };
  
  // Função para calcular quantas vezes uma transação recorrente vai se repetir
  const calculateRecurringCount = (transaction: Transaction): number => {
    if (!transaction.is_recurring || !transaction.recurring_type || !transaction.recurring_interval) {
      return 1;
    }
    
    const startDate = new Date(transaction.date);
    const endDate = transaction.recurring_end_date ? new Date(transaction.recurring_end_date) : new Date(startDate.getTime() + (365 * 24 * 60 * 60 * 1000)); // 1 ano se não especificado
    
    let count = 1; // Conta a transação original
    let currentDate = new Date(startDate);
    
    while (currentDate < endDate) {
      switch (transaction.recurring_type) {
        case 'daily':
          currentDate.setDate(currentDate.getDate() + transaction.recurring_interval);
          break;
        case 'weekly':
          currentDate.setDate(currentDate.getDate() + (7 * transaction.recurring_interval));
          break;
        case 'monthly':
          currentDate.setMonth(currentDate.getMonth() + transaction.recurring_interval);
          break;
        case 'yearly':
          currentDate.setFullYear(currentDate.getFullYear() + transaction.recurring_interval);
          break;
        default:
          return 1;
      }
      
      if (currentDate <= endDate) {
        count++;
      }
    }
    
    return count;
  };
  
  // Função para verificar se uma transação tem instâncias subsequentes
  const hasSubsequentInstances = (transaction: Transaction): boolean => {
    if (!transaction.parent_transaction_id) return false;
    
    // Buscar todas as transações da mesma série
    const allInstances = transactions.filter(t => 
      t.parent_transaction_id === transaction.parent_transaction_id
    ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Encontrar a posição da transação atual
    const currentIndex = allInstances.findIndex(t => t.id === transaction.id);
    
    // Se não é a última transação da série, tem instâncias subsequentes
    return currentIndex !== -1 && currentIndex < allInstances.length - 1;
  };
  
  if (transactionsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando transações...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Gerenciar Transações</h1>
                <p className="text-gray-600">Gerencie todas as suas transações financeiras</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={onBack}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <ChevronLeft size={20} className="inline mr-2" />
                  Voltar
                </button>
                <button
                  onClick={() => setIsAddFormOpen(true)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Plus size={20} />
                  Nova Transação
                </button>
              </div>
            </div>
            
            {/* Filtros */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* Busca */}
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar transações..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              {/* Filtro de Tipo */}
              <select
                value={typeFilter}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Todos os tipos</option>
                <option value="income">Receitas</option>
                <option value="expense">Despesas</option>
              </select>
              
              {/* Filtro de Categoria */}
              <select
                value={categoryFilter}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Todas as categorias</option>
                {categories.map(category => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
              
              {/* Filtro de Data */}
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => handleFilterChange('date', e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            {/* Controles de Ordenação e Limpar Filtros */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">Ordenar por:</span>
                <div className="flex gap-2">
                  {[
                    { key: 'date', label: 'Data' },
                    { key: 'amount', label: 'Valor' },
                    { key: 'description', label: 'Descrição' }
                  ].map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => handleSort(key as 'date' | 'amount' | 'description')}
                      className={`px-3 py-1 rounded-md text-sm transition-colors ${
                        sortBy === key
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {label} {sortBy === key && (sortOrder === 'asc' ? '↑' : '↓')}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {(() => {
                  const pendingIncomeCount = filteredTransactions.filter(
                    t => t.type === 'income' && !t.received
                  ).length;
                  
                  return pendingIncomeCount > 0 && (
                    <button
                      onClick={handleMarkAllReceived}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center gap-2"
                    >
                      <CheckCircle size={16} />
                      Marcar Todas como Recebidas ({pendingIncomeCount})
                    </button>
                  );
                })()}
                
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm"
                >
                  Limpar Filtros
                </button>
              </div>
            </div>
          </div>
          
          {/* Lista de Transações */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {paginatedTransactions.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📊</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhuma transação encontrada</h3>
                <p className="text-gray-600 mb-4">
                  {filteredTransactions.length === 0 
                    ? 'Não há transações que correspondam aos filtros aplicados.'
                    : 'Tente ajustar os filtros de busca.'
                  }
                </p>
                <button
                  onClick={() => setIsAddFormOpen(true)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Criar Primeira Transação
                </button>
              </div>
            ) : (
              <>
                {/* Cabeçalho da Tabela */}
                <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                  <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
                    <div className="col-span-3">Descrição</div>
                    <div className="col-span-2">Categoria</div>
                    <div className="col-span-2">Data</div>
                    <div className="col-span-2">Valor</div>
                    <div className="col-span-2">Tipo</div>
                    <div className="col-span-1">Ações</div>
                  </div>
                </div>
                
                {/* Linhas da Tabela */}
                <div className="divide-y divide-gray-200">
                  {paginatedTransactions.map((transaction) => (
                    <motion.div
                      key={transaction.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="px-6 py-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="grid grid-cols-12 gap-4 items-center">
                        {/* Descrição */}
                        <div className="col-span-3">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900 truncate">
                              {transaction.is_recurring ? (
                                <>
                                  {transaction.description}
                                  <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                    1/{calculateRecurringCount(transaction)}
                                  </span>
                                </>
                              ) : (
                                transaction.description
                              )}
                            </span>
                          </div>
                        </div>
                        
                        {/* Categoria */}
                        <div className="col-span-2">
                          <span className="text-gray-600">{transaction.category}</span>
                        </div>
                        
                        {/* Data */}
                        <div className="col-span-2">
                          <span className="text-gray-600">{formatDate(transaction.date)}</span>
                        </div>
                        
                        {/* Valor */}
                        <div className="col-span-2">
                          <span className={`font-semibold ${
                            transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {formatCurrency(transaction.amount)}
                          </span>
                        </div>
                        
                        {/* Tipo */}
                        <div className="col-span-2">
                          <div className="flex items-center gap-2">
                            {transaction.type === 'income' ? (
                              <ArrowUpCircle size={16} className="text-green-500" />
                            ) : (
                              <ArrowDownCircle size={16} className="text-red-500" />
                            )}
                            <div className="flex flex-col">
                              <span className="text-sm text-gray-600 capitalize">
                                {transaction.type === 'income' ? 'Receita' : 'Despesa'}
                              </span>
                              {transaction.type === 'income' && (
                                <span className={`text-xs ${
                                  transaction.received ? 'text-green-600' : 'text-orange-500'
                                }`}>
                                  {transaction.received ? '✅ Recebido' : '⏳ Pendente'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Ações */}
                        <div className="col-span-1">
                          <div className="flex items-center gap-2">
                            {transaction.type === 'income' && !transaction.received && (
                              <button
                                onClick={() => handleMarkAsReceived(transaction)}
                                className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                                title="Marcar como Recebido"
                              >
                                <CheckCircle size={16} />
                              </button>
                            )}
                            <button
                              onClick={() => handleEdit(transaction)}
                              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                              title="Editar"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(transaction)}
                              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                              title="Deletar"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                {/* Paginação */}
                {totalPages > 1 && (
                  <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredTransactions.length)} de {filteredTransactions.length} transações
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className="px-3 py-1 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronLeft size={16} />
                        </button>
                        
                        <div className="flex gap-1">
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`px-3 py-1 rounded-md text-sm ${
                                currentPage === page
                                  ? 'bg-blue-600 text-white'
                                  : 'text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              {page}
                            </button>
                          ))}
                        </div>
                        
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className="px-3 py-1 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
        
        {/* Modal de Adicionar/Editar Transação */}
        <AnimatePresence>
          {isAddFormOpen && (
            <AddTransactionForm
              categories={categories}
              onAddTransaction={handleAddTransaction}
              isOpen={isAddFormOpen}
              onClose={() => {
                setIsAddFormOpen(false);
                setEditingTransaction(null);
              }}
              editingTransaction={editingTransaction}
            />
          )}
        </AnimatePresence>
        
        {/* Modal de Confirmação de Exclusão */}
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setDeletingTransaction(null);
          }}
          onConfirm={handleConfirmDelete}
          transactionDescription={deletingTransaction?.description || ''}
          isRecurring={deletingTransaction?.is_recurring || false}
          hasSubsequentInstances={deletingTransaction ? hasSubsequentInstances(deletingTransaction) : false}
        />
      </div>
    </div>
  );
};
