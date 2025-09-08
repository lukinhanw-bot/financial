const crypto = require('crypto');
const database = require('../database/database');

// Função auxiliar para calcular próxima data de recorrência
function calculateNextRecurringDate(startDate, recurringType, interval) {
  const start = new Date(startDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let nextDate = new Date(start);
  
  while (nextDate <= today) {
    switch (recurringType) {
      case 'daily':
        nextDate.setDate(nextDate.getDate() + interval);
        break;
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + (7 * interval));
        break;
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + interval);
        break;
      case 'yearly':
        nextDate.setFullYear(nextDate.getFullYear() + interval);
        break;
      default:
        return null;
    }
  }
  
  return nextDate.toISOString().split('T')[0];
}

class Transaction {
  constructor(data) {
    this.id = data.id || crypto.randomUUID();
    this.user_id = data.user_id || 'default';
    this.type = data.type;
    this.amount = data.amount;
    this.description = data.description;
    this.category = data.category;
    this.date = data.date;
    this.is_recurring = data.is_recurring || false;
    this.recurring_type = data.recurring_type || null;
    this.recurring_interval = data.recurring_interval || 1;
    this.recurring_end_date = data.recurring_end_date || null;
    this.parent_transaction_id = data.parent_transaction_id || null;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  static async findAll(userId = 'default') {
    return new Promise((resolve, reject) => {
      const db = database.getDb();
      db.all(
        'SELECT * FROM transactions WHERE user_id = ? ORDER BY date ASC',
        [userId],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows.map(row => new Transaction(row)));
          }
        }
      );
    });
  }

  static async findById(id, userId = 'default') {
    return new Promise((resolve, reject) => {
      const db = database.getDb();
      db.get(
        'SELECT * FROM transactions WHERE id = ? AND user_id = ?',
        [id, userId],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row ? new Transaction(row) : null);
          }
        }
      );
    });
  }

  async save() {
    return new Promise((resolve, reject) => {
      const db = database.getDb();
      const now = new Date().toISOString();
      
      db.run(
        `INSERT INTO transactions (id, user_id, type, amount, description, category, date, is_recurring, recurring_type, recurring_interval, recurring_end_date, parent_transaction_id, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [this.id, this.user_id, this.type, this.amount, this.description, this.category, this.date, this.is_recurring, this.recurring_type, this.recurring_interval, this.recurring_end_date, this.parent_transaction_id, now, now],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.lastID);
          }
        }
      );
    });
  }

  async update() {
    return new Promise((resolve, reject) => {
      const db = database.getDb();
      const now = new Date().toISOString();
      
      db.run(
        `UPDATE transactions 
         SET type = ?, amount = ?, description = ?, category = ?, date = ?, is_recurring = ?, recurring_type = ?, recurring_interval = ?, recurring_end_date = ?, parent_transaction_id = ?, updated_at = ?
         WHERE id = ? AND user_id = ?`,
        [this.type, this.amount, this.description, this.category, this.date, this.is_recurring, this.recurring_type, this.recurring_interval, this.recurring_end_date, this.parent_transaction_id, now, this.id, this.user_id],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.changes);
          }
        }
      );
    });
  }

  static async delete(id, userId = 'default') {
    return new Promise((resolve, reject) => {
      const db = database.getDb();
      db.run(
        'DELETE FROM transactions WHERE id = ? AND user_id = ?',
        [id, userId],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.changes);
          }
        }
      );
    });
  }

  static async getMonthlyStats(userId = 'default', year, month) {
    return new Promise((resolve, reject) => {
      const db = database.getDb();
      db.all(
        `SELECT 
           type,
           SUM(amount) as total,
           COUNT(*) as count
         FROM transactions 
         WHERE user_id = ? 
           AND strftime('%Y', date) = ? 
           AND strftime('%m', date) = ?
         GROUP BY type`,
        [userId, year.toString(), month.toString().padStart(2, '0')],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            const stats = {
              income: { total: 0, count: 0 },
              expense: { total: 0, count: 0 }
            };
            
            rows.forEach(row => {
              stats[row.type] = {
                total: parseFloat(row.total),
                count: row.count
              };
            });
            
            resolve(stats);
          }
        }
      );
    });
  }

  // Gerar transações recorrentes baseadas na data atual
  static async generateRecurringTransactions(userId = 'default') {
    return new Promise((resolve, reject) => {
      const db = database.getDb();
      const today = new Date().toISOString().split('T')[0];
      
      // Buscar transações recorrentes ativas
      db.all(
        `SELECT * FROM transactions 
         WHERE user_id = ? 
           AND is_recurring = 1 
           AND (recurring_end_date IS NULL OR recurring_end_date >= ?)
           AND parent_transaction_id IS NULL`,
        [userId, today],
        async (err, parentTransactions) => {
          if (err) {
            reject(err);
          } else {
            const generatedTransactions = [];
            
            for (const parent of parentTransactions) {
              // Gerar todas as instâncias necessárias até hoje
              const instances = await this.generateAllRecurringInstances(parent, today, userId);
              generatedTransactions.push(...instances);
            }
            
            resolve(generatedTransactions);
          }
        }
      );
    });
  }

  // Gerar todas as instâncias de uma transação recorrente
  static async generateAllRecurringInstances(parent, today, userId) {
    const generatedTransactions = [];
    const startDate = new Date(parent.date);
    const endDate = parent.recurring_end_date ? new Date(parent.recurring_end_date) : null;
    
    // Calcular quantas instâncias gerar baseado no intervalo e data final
    let maxInstances = 12; // Limite padrão de 12 instâncias
    
    if (endDate) {
      // Calcular diferença em meses
      const monthsDiff = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                        (endDate.getMonth() - startDate.getMonth()) + 1; // +1 para incluir o mês final
      maxInstances = Math.ceil(monthsDiff / parent.recurring_interval);
    }
    
    // Atualizar a transação original com a numeração e torná-la não recorrente
    const originalDescription = parent.description;
    parent.description = `${originalDescription} 1/${maxInstances}`;
    parent.is_recurring = false;
    parent.parent_transaction_id = parent.id; // Linkar com ela mesma
    await parent.save();
    
    // Gerar as demais instâncias (começando da segunda)
    let currentDate = new Date(startDate);
    this.advanceDate(currentDate, parent.recurring_type, parent.recurring_interval);
    
    for (let instanceCount = 2; instanceCount <= maxInstances; instanceCount++) {
      const dateStr = currentDate.toISOString().split('T')[0];
      
      // Verificar se já existe uma transação para esta data
      const existing = await this.findRecurringInstance(parent.id, dateStr, userId);
      
      if (!existing) {
        const newTransaction = new Transaction({
          user_id: userId,
          type: parent.type,
          amount: parent.amount,
          description: `${originalDescription} ${instanceCount}/${maxInstances}`,
          category: parent.category,
          date: dateStr,
          is_recurring: false,
          parent_transaction_id: parent.id
        });
        
        await newTransaction.save();
        generatedTransactions.push(newTransaction);
      }
      
      // Avançar para o próximo período
      this.advanceDate(currentDate, parent.recurring_type, parent.recurring_interval);
    }
    
    // Retornar apenas as instâncias geradas, não a transação original
    return generatedTransactions;
  }
  
  // Avançar data baseado no tipo de recorrência
  static advanceDate(date, recurringType, interval) {
    const originalDay = date.getDate();
    
    switch (recurringType) {
      case 'daily':
        date.setDate(date.getDate() + interval);
        break;
      case 'weekly':
        date.setDate(date.getDate() + (7 * interval));
        break;
      case 'monthly':
        date.setMonth(date.getMonth() + interval);
        // Manter o dia original, mas se o mês não tiver esse dia, usar o último dia do mês
        const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
        const targetDay = Math.min(originalDay, lastDayOfMonth);
        date.setDate(targetDay);
        break;
      case 'yearly':
        date.setFullYear(date.getFullYear() + interval);
        // Manter o dia original, mas se o mês não tiver esse dia, usar o último dia do mês
        const lastDayOfYearMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
        const targetDayYear = Math.min(originalDay, lastDayOfYearMonth);
        date.setDate(targetDayYear);
        break;
    }
  }

  // Encontrar instância específica de transação recorrente
  static async findRecurringInstance(parentId, date, userId = 'default') {
    return new Promise((resolve, reject) => {
      const db = database.getDb();
      db.get(
        'SELECT * FROM transactions WHERE parent_transaction_id = ? AND date = ? AND user_id = ?',
        [parentId, date, userId],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row ? new Transaction(row) : null);
          }
        }
      );
    });
  }

  // Deletar transação recorrente e todas suas instâncias
  static async deleteRecurring(parentId, userId = 'default') {
    return new Promise((resolve, reject) => {
      const db = database.getDb();
      db.run(
        'DELETE FROM transactions WHERE (id = ? OR parent_transaction_id = ?) AND user_id = ?',
        [parentId, parentId, userId],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.changes);
          }
        }
      );
    });
  }
}

module.exports = Transaction;