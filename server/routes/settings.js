const express = require('express');
const Settings = require('../models/Settings');
const router = express.Router();

// GET /api/settings - Buscar configurações do usuário
router.get('/', async (req, res) => {
  try {
    const userId = req.query.userId || 'default';
    let settings = await Settings.findByUserId(userId);
    
    // Se não existir configuração, cria uma padrão
    if (!settings) {
      settings = new Settings({
        user_id: userId,
        initial_balance: 0
      });
      await settings.save();
    }
    
    res.json(settings);
  } catch (error) {
    console.error('Erro ao buscar configurações:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /api/settings - Atualizar configurações do usuário
router.put('/', async (req, res) => {
  try {
    const userId = req.body.userId || 'default';
    const { initial_balance } = req.body;
    
    // Validações
    if (initial_balance === undefined || initial_balance === null) {
      return res.status(400).json({ error: 'Saldo inicial é obrigatório' });
    }
    
    if (isNaN(initial_balance) || initial_balance < 0) {
      return res.status(400).json({ error: 'Saldo inicial deve ser um número positivo' });
    }
    
    // Busca configuração existente ou cria nova
    let settings = await Settings.findByUserId(userId);
    
    if (!settings) {
      settings = new Settings({
        user_id: userId,
        initial_balance: parseFloat(initial_balance)
      });
    } else {
      settings.initial_balance = parseFloat(initial_balance);
    }
    
    await settings.save();
    res.json(settings);
  } catch (error) {
    console.error('Erro ao atualizar configurações:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE /api/settings - Deletar configurações do usuário (resetar para padrão)
router.delete('/', async (req, res) => {
  try {
    const userId = req.query.userId || 'default';
    await Settings.delete(userId);
    
    // Cria configuração padrão
    const defaultSettings = new Settings({
      user_id: userId,
      initial_balance: 0
    });
    await defaultSettings.save();
    
    res.json({ message: 'Configurações resetadas para padrão', settings: defaultSettings });
  } catch (error) {
    console.error('Erro ao resetar configurações:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
