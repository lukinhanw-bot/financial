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
    this.received = data.received || false;
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
        `INSERT INTO transactions (id, user_id, type, amount, description, category, date, is_recurring, recurring_type, recurring_interval, recurring_end_date, parent_transaction_id, received, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [this.id, this.user_id, this.type, this.amount, this.description, this.category, this.date, this.is_recurring, this.recurring_type, this.recurring_interval, this.recurring_end_date, this.parent_transaction_id, this.received, now, now],
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
         SET type = ?, amount = ?, description = ?, category = ?, date = ?, is_recurring = ?, recurring_type = ?, recurring_interval = ?, recurring_end_date = ?, parent_transaction_id = ?, received = ?, updated_at = ?
         WHERE id = ? AND user_id = ?`,
        [this.type, this.amount, this.description, this.category, this.date, this.is_recurring, this.recurring_type, this.recurring_interval, this.recurring_end_date, this.parent_transaction_id, this.received, now, this.id, this.user_id],
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
           AND (type = 'expense' OR (type = 'income' AND received = 1))
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
      console.log('🟡 [generateRecurringTransactions] Iniciando busca por transações recorrentes');
      const db = database.getDb();
      const today = new Date().toISOString().split('T')[0];
      console.log('📅 Data atual:', today);
      
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
            console.error('❌ Erro ao buscar transações recorrentes:', err);
            reject(err);
          } else {
            console.log(`🔍 Encontradas ${parentTransactions.length} transações recorrentes ativas`);
            parentTransactions.forEach((t, i) => {
              console.log(`  ${i + 1}. "${t.description}" - ${t.date} - ${t.recurring_type}`);
            });
            
            const generatedTransactions = [];
            
            for (const parent of parentTransactions) {
              console.log(`🔄 Processando transação recorrente: "${parent.description}"`);
              // Gerar todas as instâncias necessárias até hoje
              const instances = await this.generateAllRecurringInstances(parent, today, userId);
              generatedTransactions.push(...instances);
              console.log(`✅ Processada: ${instances.length} instâncias geradas`);
            }
            
            console.log(`🎉 Total final: ${generatedTransactions.length} transações geradas`);
            resolve(generatedTransactions);
          }
        }
      );
    });
  }

  // Gerar todas as instâncias de uma transação recorrente
  static async generateAllRecurringInstances(parent, today, userId) {
    console.log('🔄 [generateAllRecurringInstances] Iniciando geração de instâncias');
    console.log('📝 Parent transaction:', {
      id: parent.id,
      description: parent.description,
      date: parent.date,
      is_recurring: parent.is_recurring,
      recurring_type: parent.recurring_type,
      recurring_interval: parent.recurring_interval,
      recurring_end_date: parent.recurring_end_date
    });
    
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
    
    console.log('📊 Cálculos:', {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate ? endDate.toISOString().split('T')[0] : 'null',
      maxInstances,
      recurring_interval: parent.recurring_interval
    });
    
    // Salvar a transação original primeiro
    console.log('💾 Salvando transação original...');
    await parent.save();
    console.log('✅ Transação original salva com ID:', parent.id);
    
    // Atualizar a transação original com a numeração e torná-la não recorrente
    const originalDescription = parent.description;
    parent.description = `${originalDescription} 1/${maxInstances}`;
    parent.is_recurring = false;
    parent.parent_transaction_id = parent.id; // Linkar com ela mesma
    
    console.log('🔄 Atualizando transação original para:', {
      description: parent.description,
      is_recurring: parent.is_recurring,
      parent_transaction_id: parent.parent_transaction_id
    });
    
    // Atualizar a transação existente
    await parent.update();
    console.log('✅ Transação original atualizada');
    
    // Adicionar a transação original modificada às transações geradas
    generatedTransactions.push(parent);
    console.log('📋 Transação original adicionada às geradas');
    
    // Gerar as demais instâncias (começando da segunda)
    console.log('🔄 Gerando demais instâncias...');
    let currentDate = new Date(startDate);
    this.advanceDate(currentDate, parent.recurring_type, parent.recurring_interval);
    
    for (let instanceCount = 2; instanceCount <= maxInstances; instanceCount++) {
      const dateStr = currentDate.toISOString().split('T')[0];
      console.log(`📅 Processando instância ${instanceCount}/${maxInstances} para data ${dateStr}`);
      
      // Verificar se já existe uma transação para esta data
      const existing = await this.findRecurringInstance(parent.id, dateStr, userId);
      
      if (!existing) {
        console.log(`✅ Criando nova instância ${instanceCount}/${maxInstances}`);
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
        console.log(`✅ Instância ${instanceCount}/${maxInstances} salva com ID: ${newTransaction.id}`);
      } else {
        console.log(`⚠️ Instância ${instanceCount}/${maxInstances} já existe, pulando...`);
      }
      
      // Avançar para o próximo período
      this.advanceDate(currentDate, parent.recurring_type, parent.recurring_interval);
    }
    
    console.log(`🎉 Geração concluída! Total de ${generatedTransactions.length} transações geradas`);
    return generatedTransactions;
  }
  
  // Avançar data baseado no tipo de recorrência
  static advanceDate(date, recurringType, interval) {
    const originalDay = date.getDate();
    const originalMonth = date.getMonth();
    const originalYear = date.getFullYear();
    
    switch (recurringType) {
      case 'daily':
        date.setDate(date.getDate() + interval);
        break;
      case 'weekly':
        date.setDate(date.getDate() + (7 * interval));
        break;
      case 'monthly':
        // Calcular o novo mês e ano
        let newMonth = originalMonth + interval;
        let newYear = originalYear;
        
        // Ajustar ano se necessário
        while (newMonth > 11) {
          newMonth -= 12;
          newYear += 1;
        }
        while (newMonth < 0) {
          newMonth += 12;
          newYear -= 1;
        }
        
        // Usar setMonth() que é mais confiável para avanços de mês
        date.setMonth(newMonth);
        
        // Se o dia não existe no mês (ex: 31 de fevereiro), usar o último dia do mês
        if (date.getMonth() !== newMonth) {
          date.setDate(0); // Vai para o último dia do mês anterior
        }
        break;
      case 'yearly':
        // Avançar o ano
        date.setFullYear(originalYear + interval);
        
        // Se o dia não existe no mês (ex: 29 de fevereiro em ano não bissexto), usar o último dia do mês
        if (date.getMonth() !== originalMonth) {
          date.setDate(0); // Vai para o último dia do mês anterior
        }
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

  // Deletar transação e todas as instâncias subsequentes (para frente)
  static async deleteForward(transactionId, userId = 'default') {
    return new Promise((resolve, reject) => {
      const db = database.getDb();
      
      // Primeiro, buscar a transação para obter informações
      db.get(
        'SELECT * FROM transactions WHERE id = ? AND user_id = ?',
        [transactionId, userId],
        async (err, transaction) => {
          if (err) {
            reject(err);
            return;
          }
          
          if (!transaction) {
            reject(new Error('Transação não encontrada'));
            return;
          }
          
          try {
            // Se for uma transação com parent_transaction_id, deletar ela e todas as subsequentes
            if (transaction.parent_transaction_id) {
              // Buscar todas as transações da mesma série (mesmo parent_transaction_id)
              const allInstances = await this.findAllInstances(transaction.parent_transaction_id, userId);
              
              // Encontrar a posição da transação atual na série
              const currentIndex = allInstances.findIndex(t => t.id === transactionId);
              
              if (currentIndex === -1) {
                reject(new Error('Transação não encontrada na série'));
                return;
              }
              
              // Deletar a transação atual e todas as subsequentes
              const instancesToDelete = allInstances.slice(currentIndex);
              const idsToDelete = instancesToDelete.map(t => t.id);
              
              console.log(`🗑️ Deletando ${idsToDelete.length} transações para frente:`, idsToDelete);
              
              // Deletar todas as transações identificadas
              const placeholders = idsToDelete.map(() => '?').join(',');
              db.run(
                `DELETE FROM transactions WHERE id IN (${placeholders}) AND user_id = ?`,
                [...idsToDelete, userId],
                function(err) {
                  if (err) {
                    reject(err);
                  } else {
                    resolve(this.changes);
                  }
                }
              );
            } else {
              // Se for a transação pai, deletar toda a série
              await this.deleteRecurring(transactionId, userId);
              resolve(1);
            }
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  }

  // Buscar todas as instâncias de uma transação recorrente
  static async findAllInstances(parentId, userId = 'default') {
    return new Promise((resolve, reject) => {
      const db = database.getDb();
      db.all(
        'SELECT * FROM transactions WHERE parent_transaction_id = ? AND user_id = ? ORDER BY date ASC',
        [parentId, userId],
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
}

module.exports = Transaction;