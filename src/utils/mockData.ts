import { Transaction, Category } from '../types';

export const categories: Category[] = [
  // Income categories
  { id: '1', name: 'Salário', icon: 'Briefcase', color: '#10B981', type: 'income' },
  { id: '2', name: 'Freelancer', icon: 'Code', color: '#059669', type: 'income' },
  { id: '3', name: 'Vendas', icon: 'ShoppingBag', color: '#0D9488', type: 'income' },
  { id: '4', name: 'Investimentos', icon: 'TrendingUp', color: '#0F766E', type: 'income' },
  
  // Expense categories
  { id: '5', name: 'Alimentação', icon: 'UtensilsCrossed', color: '#EF4444', type: 'expense' },
  { id: '6', name: 'Transporte', icon: 'Car', color: '#DC2626', type: 'expense' },
  { id: '7', name: 'Moradia', icon: 'Home', color: '#B91C1C', type: 'expense' },
  { id: '8', name: 'Entretenimento', icon: 'Gamepad2', color: '#991B1B', type: 'expense' },
  { id: '9', name: 'Saúde', icon: 'Heart', color: '#7F1D1D', type: 'expense' },
  { id: '10', name: 'Compras', icon: 'ShoppingCart', color: '#F59E0B', type: 'expense' },
];

export const generateMockTransactions = (): Transaction[] => {
  const transactions: Transaction[] = [];
  const currentDate = new Date();
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  
  // Generate transactions for the current month
  for (let day = 1; day <= 30; day++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dateStr = date.toISOString().split('T')[0];
    
    // Income every 5-10 days
    if (day % 7 === 0 || day % 10 === 3) {
      const incomeCategories = categories.filter(c => c.type === 'income');
      const category = incomeCategories[Math.floor(Math.random() * incomeCategories.length)];
      
      transactions.push({
        id: `income-${day}`,
        type: 'income',
        amount: Math.floor(Math.random() * 2000) + 800,
        description: `${category.name} - ${day}/${currentDate.getMonth() + 1}`,
        category: category.name,
        date: dateStr,
        createdAt: date.toISOString(),
      });
    }
    
    // Expenses on random days
    if (Math.random() > 0.4) {
      const expenseCategories = categories.filter(c => c.type === 'expense');
      const category = expenseCategories[Math.floor(Math.random() * expenseCategories.length)];
      
      transactions.push({
        id: `expense-${day}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'expense',
        amount: Math.floor(Math.random() * 400) + 50,
        description: `${category.name} - ${day}/${currentDate.getMonth() + 1}`,
        category: category.name,
        date: dateStr,
        createdAt: date.toISOString(),
      });
    }
  }
  
  return transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};