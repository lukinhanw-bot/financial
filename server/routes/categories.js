const express = require('express');
const Category = require('../models/Category');
const router = express.Router();

// GET /api/categories - Listar todas as categorias
router.get('/', async (req, res) => {
  try {
    const userId = req.query.userId || 'default';
    const type = req.query.type;
    
    let categories;
    if (type) {
      categories = await Category.findByType(type, userId);
    } else {
      categories = await Category.findAll(userId);
    }
    
    res.json(categories);
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/categories/:id - Buscar categoria por ID
router.get('/:id', async (req, res) => {
  try {
    const userId = req.query.userId || 'default';
    const category = await Category.findById(req.params.id, userId);
    
    if (!category) {
      return res.status(404).json({ error: 'Categoria não encontrada' });
    }
    
    res.json(category);
  } catch (error) {
    console.error('Erro ao buscar categoria:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/categories - Criar nova categoria
router.post('/', async (req, res) => {
  try {
    const { name, icon, color, type } = req.body;
    const userId = req.body.userId || 'default';
    
    // Validações
    if (!name || !icon || !color || !type) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }
    
    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({ error: 'Tipo deve ser income ou expense' });
    }
    
    // Verificar se já existe categoria com mesmo nome para o usuário
    const existingCategories = await Category.findAll(userId);
    const nameExists = existingCategories.some(cat => 
      cat.name.toLowerCase() === name.toLowerCase() && cat.type === type
    );
    
    if (nameExists) {
      return res.status(400).json({ error: 'Já existe uma categoria com este nome' });
    }
    
    const category = new Category({
      user_id: userId,
      name,
      icon,
      color,
      type
    });
    
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    console.error('Erro ao criar categoria:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /api/categories/:id - Atualizar categoria
router.put('/:id', async (req, res) => {
  try {
    const userId = req.body.userId || 'default';
    const category = await Category.findById(req.params.id, userId);
    
    if (!category) {
      return res.status(404).json({ error: 'Categoria não encontrada' });
    }
    
    // Não permitir editar categorias padrão
    if (category.user_id === 'default') {
      return res.status(403).json({ error: 'Não é possível editar categorias padrão' });
    }
    
    const { name, icon, color, type } = req.body;
    
    // Validações
    if (type && !['income', 'expense'].includes(type)) {
      return res.status(400).json({ error: 'Tipo deve ser income ou expense' });
    }
    
    // Verificar nome duplicado
    if (name && name !== category.name) {
      const existingCategories = await Category.findAll(userId);
      const nameExists = existingCategories.some(cat => 
        cat.name.toLowerCase() === name.toLowerCase() && 
        cat.type === (type || category.type) &&
        cat.id !== category.id
      );
      
      if (nameExists) {
        return res.status(400).json({ error: 'Já existe uma categoria com este nome' });
      }
    }
    
    // Atualizar campos
    if (name) category.name = name;
    if (icon) category.icon = icon;
    if (color) category.color = color;
    if (type) category.type = type;
    
    await category.update();
    res.json(category);
  } catch (error) {
    console.error('Erro ao atualizar categoria:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE /api/categories/:id - Deletar categoria
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.query.userId || 'default';
    
    const category = await Category.findById(req.params.id, userId);
    if (!category) {
      return res.status(404).json({ error: 'Categoria não encontrada' });
    }
    
    const changes = await Category.delete(req.params.id, userId);
    
    if (changes === 0) {
      return res.status(404).json({ error: 'Categoria não encontrada ou não pode ser deletada' });
    }
    
    res.json({ message: 'Categoria deletada com sucesso' });
  } catch (error) {
    if (error.message === 'Não é possível deletar categorias padrão') {
      return res.status(403).json({ error: error.message });
    }
    console.error('Erro ao deletar categoria:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;