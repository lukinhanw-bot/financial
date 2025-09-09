import { Transaction, DailyBalance } from '../types';

export const calculateDailyBalances = (
  transactions: Transaction[],
  initialBalance: number = 0
): DailyBalance[] => {
  const transactionsByDate = new Map<string, Transaction[]>();
  
  // Group transactions by date
  transactions.forEach(transaction => {
    const date = transaction.date;
    if (!transactionsByDate.has(date)) {
      transactionsByDate.set(date, []);
    }
    transactionsByDate.get(date)!.push(transaction);
  });
  
  // Generate daily balances
  const dailyBalances: DailyBalance[] = [];
  let runningBalance = initialBalance;
  
  // Get all unique dates and sort them
  const allDates = Array.from(transactionsByDate.keys()).sort();
  
  allDates.forEach(date => {
    const dayTransactions = transactionsByDate.get(date) || [];
    
    // Calculate day's net change
    const dayChange = dayTransactions.reduce((sum, transaction) => {
      if (transaction.type === 'income') {
        // Only count income if it's received
        return sum + (transaction.received ? transaction.amount : 0);
      } else {
        // Always count expenses
        return sum - transaction.amount;
      }
    }, 0);
    
    runningBalance += dayChange;
    
    dailyBalances.push({
      date,
      balance: runningBalance,
      transactions: dayTransactions,
    });
  });
  
  return dailyBalances;
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
};

export const formatDate = (date: string): string => {
  // Adicionar 'T12:00:00' para evitar problemas de timezone
  // Isso garante que a data seja interpretada no timezone local
  const localDate = new Date(date + 'T12:00:00');
  return localDate.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'short',
  });
};