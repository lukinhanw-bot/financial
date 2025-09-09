const express = require('express');
const Transaction = require('../models/Transaction');
const router = express.Router();

// GET /api/transactions - Listar todas as transações
router.get('/', async (req, res) => {
  try {
    const userId = req.query.userId || 'default';
    const transactions = await Transaction.findAll(userId);
    res.json(transactions);
  } catch (error) {
    console.error('Erro ao buscar transações:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/transactions/:id - Buscar transação por ID
router.get('/:id', async (req, res) => {
  try {
    const userId = req.query.userId || 'default';
    const transaction = await Transaction.findById(req.params.id, userId);
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transação não encontrada' });
    }
    
    res.json(transaction);
  } catch (error) {
    console.error('Erro ao buscar transação:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/transactions - Criar nova transação
router.post('/', async (req, res) => {
  try {
    console.log('🔵 [POST /transactions] Iniciando criação de transação');
    console.log('📝 Dados recebidos:', JSON.stringify(req.body, null, 2));
    
    const { 
      type, 
      amount, 
      description, 
      category, 
      date, 
      is_recurring, 
      recurring_type, 
      recurring_interval, 
      recurring_end_date 
    } = req.body;
    const userId = req.body.userId || 'default';
    
    console.log('🔍 Dados processados:', {
      type, amount, description, category, date, is_recurring, 
      recurring_type, recurring_interval, recurring_end_date, userId
    });
    
    // Validações
    if (!type || !amount || !description || !category || !date) {
      console.log('❌ Validação falhou: campos obrigatórios ausentes');
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }
    
    if (!['income', 'expense'].includes(type)) {
      console.log('❌ Validação falhou: tipo inválido');
      return res.status(400).json({ error: 'Tipo deve ser income ou expense' });
    }
    
    if (isNaN(amount) || amount <= 0) {
      console.log('❌ Validação falhou: valor inválido');
      return res.status(400).json({ error: 'Valor deve ser um número positivo' });
    }
    
    // Validações para recorrência
    if (is_recurring) {
      console.log('🔄 Transação é recorrente, validando parâmetros...');
      if (!recurring_type || !['daily', 'weekly', 'monthly', 'yearly'].includes(recurring_type)) {
        console.log('❌ Validação falhou: tipo de recorrência inválido');
        return res.status(400).json({ error: 'Tipo de recorrência inválido' });
      }
      
      if (!recurring_interval || recurring_interval < 1) {
        console.log('❌ Validação falhou: intervalo de recorrência inválido');
        return res.status(400).json({ error: 'Intervalo de recorrência deve ser maior que 0' });
      }
    }
    
    const transaction = new Transaction({
      user_id: userId,
      type,
      amount: parseFloat(amount),
      description,
      category,
      date,
      is_recurring: is_recurring || false,
      recurring_type: recurring_type || null,
      recurring_interval: recurring_interval || 1,
      recurring_end_date: recurring_end_date || null
    });
    
    console.log('📦 Objeto Transaction criado:', {
      id: transaction.id,
      description: transaction.description,
      is_recurring: transaction.is_recurring,
      recurring_type: transaction.recurring_type
    });
    
    // Se for recorrente, gerar instâncias diretamente sem salvar a transação original primeiro
    if (is_recurring) {
      console.log('🔄 Processando transação recorrente...');
      const generatedTransactions = await Transaction.generateAllRecurringInstances(transaction, new Date(), userId);
      console.log(`✅ Geradas ${generatedTransactions.length} transações recorrentes`);
      console.log('📋 Transações geradas:', generatedTransactions.map(t => ({
        id: t.id,
        description: t.description,
        date: t.date,
        is_recurring: t.is_recurring
      })));
      // Retornar a primeira transação (que é a original modificada)
      res.status(201).json(generatedTransactions[0]);
    } else {
      console.log('💾 Salvando transação simples...');
      await transaction.save();
      console.log('✅ Transação simples salva com sucesso');
      res.status(201).json(transaction);
    }
  } catch (error) {
    console.error('❌ Erro ao criar transação:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /api/transactions/:id - Atualizar transação
router.put('/:id', async (req, res) => {
  try {
    const userId = req.body.userId || 'default';
    const transaction = await Transaction.findById(req.params.id, userId);
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transação não encontrada' });
    }
    
    const { type, amount, description, category, date, received } = req.body;
    
    // Validações
    if (type && !['income', 'expense'].includes(type)) {
      return res.status(400).json({ error: 'Tipo deve ser income ou expense' });
    }
    
    if (amount && (isNaN(amount) || amount <= 0)) {
      return res.status(400).json({ error: 'Valor deve ser um número positivo' });
    }
    
    // Atualizar campos
    if (type) transaction.type = type;
    if (amount) transaction.amount = parseFloat(amount);
    if (description) transaction.description = description;
    if (category) transaction.category = category;
    if (date) transaction.date = date;
    if (received !== undefined) transaction.received = Boolean(received);
    
    await transaction.update();
    res.json(transaction);
  } catch (error) {
    console.error('Erro ao atualizar transação:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE /api/transactions/:id - Deletar transação
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.query.userId || 'default';
    const changes = await Transaction.delete(req.params.id, userId);
    
    if (changes === 0) {
      return res.status(404).json({ error: 'Transação não encontrada' });
    }
    
    res.json({ message: 'Transação deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar transação:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/transactions/stats/monthly - Estatísticas mensais
router.get('/stats/monthly', async (req, res) => {
  try {
    const userId = req.query.userId || 'default';
    const year = req.query.year || new Date().getFullYear();
    const month = req.query.month || new Date().getMonth() + 1;
    
    const stats = await Transaction.getMonthlyStats(userId, year, month);
    res.json(stats);
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/transactions/generate-recurring - Gerar transações recorrentes
router.post('/generate-recurring', async (req, res) => {
  try {
    console.log('🟡 [POST /generate-recurring] Iniciando geração de transações recorrentes');
    const userId = req.query.userId || 'default';
    console.log('👤 UserId:', userId);
    
    const generated = await Transaction.generateRecurringTransactions(userId);
    console.log(`✅ generate-recurring concluído: ${generated.length} transações geradas`);
    
    res.json({ 
      message: `${generated.length} transações recorrentes geradas`,
      transactions: generated 
    });
  } catch (error) {
    console.error('❌ Erro ao gerar transações recorrentes:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE /api/transactions/recurring/:id - Deletar transação recorrente e todas suas instâncias
router.delete('/recurring/:id', async (req, res) => {
  try {
    const userId = req.query.userId || 'default';
    const changes = await Transaction.deleteRecurring(req.params.id, userId);
    
    if (changes === 0) {
      return res.status(404).json({ error: 'Transação recorrente não encontrada' });
    }
    
    res.json({ message: 'Transação recorrente e todas suas instâncias foram deletadas' });
  } catch (error) {
    console.error('Erro ao deletar transação recorrente:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE /api/transactions/forward/:id - Deletar transação e todas as instâncias subsequentes
router.delete('/forward/:id', async (req, res) => {
  try {
    console.log('🗑️ [DELETE /transactions/forward] Deletando transações para frente');
    const userId = req.query.userId || 'default';
    const transactionId = req.params.id;
    
    console.log('📝 Transaction ID:', transactionId, 'User ID:', userId);
    
    const changes = await Transaction.deleteForward(transactionId, userId);
    
    if (changes === 0) {
      console.log('❌ Nenhuma transação foi deletada');
      return res.status(404).json({ error: 'Transação não encontrada' });
    }
    
    console.log(`✅ ${changes} transações deletadas para frente`);
    res.json({ 
      message: `${changes} transações foram deletadas (incluindo a atual e todas as subsequentes)`,
      deletedCount: changes
    });
  } catch (error) {
    console.error('❌ Erro ao deletar transações para frente:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;