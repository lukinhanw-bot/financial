const API_BASE_URL = 'http://localhost:3001/api';

// Configuração base para fetch
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
};

// Serviços de Transações
export const transactionService = {
  // Listar todas as transações
  getAll: async (userId = 'default') => {
    return apiRequest(`/transactions?userId=${userId}`);
  },

  // Buscar transação por ID
  getById: async (id: string, userId = 'default') => {
    return apiRequest(`/transactions/${id}?userId=${userId}`);
  },

  // Criar nova transação
  create: async (transactionData: any, userId = 'default') => {
    return apiRequest('/transactions', {
      method: 'POST',
      body: JSON.stringify({ ...transactionData, userId }),
    });
  },

  // Atualizar transação
  update: async (id: string, transactionData: any, userId = 'default') => {
    return apiRequest(`/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ ...transactionData, userId }),
    });
  },

  // Deletar transação
  delete: async (id: string, userId = 'default') => {
    return apiRequest(`/transactions/${id}?userId=${userId}`, {
      method: 'DELETE',
    });
  },

  // Estatísticas mensais
  getMonthlyStats: async (year?: number, month?: number, userId = 'default') => {
    const params = new URLSearchParams({ userId });
    if (year) params.append('year', year.toString());
    if (month) params.append('month', month.toString());
    
    return apiRequest(`/transactions/stats/monthly?${params}`);
  },

  // Gerar transações recorrentes
  generateRecurring: async (userId = 'default') => {
    return apiRequest(`/transactions/generate-recurring?userId=${userId}`, {
      method: 'POST',
    });
  },

  // Deletar transação recorrente e todas suas instâncias
  deleteRecurring: async (id: string, userId = 'default') => {
    return apiRequest(`/transactions/recurring/${id}?userId=${userId}`, {
      method: 'DELETE',
    });
  },

  // Deletar transação e todas as instâncias subsequentes (para frente)
  deleteForward: async (id: string, userId = 'default') => {
    return apiRequest(`/transactions/forward/${id}?userId=${userId}`, {
      method: 'DELETE',
    });
  },
};

// Serviços de Categorias
export const categoryService = {
  // Listar todas as categorias
  getAll: async (userId = 'default', type?: 'income' | 'expense') => {
    const params = new URLSearchParams({ userId });
    if (type) params.append('type', type);
    
    return apiRequest(`/categories?${params}`);
  },

  // Buscar categoria por ID
  getById: async (id: string, userId = 'default') => {
    return apiRequest(`/categories/${id}?userId=${userId}`);
  },

  // Criar nova categoria
  create: async (categoryData: any, userId = 'default') => {
    return apiRequest('/categories', {
      method: 'POST',
      body: JSON.stringify({ ...categoryData, userId }),
    });
  },

  // Atualizar categoria
  update: async (id: string, categoryData: any, userId = 'default') => {
    return apiRequest(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ ...categoryData, userId }),
    });
  },

  // Deletar categoria
  delete: async (id: string, userId = 'default') => {
    return apiRequest(`/categories/${id}?userId=${userId}`, {
      method: 'DELETE',
    });
  },
};

// Serviços de Configurações
export const settingsService = {
  // Buscar configurações do usuário
  get: async (userId = 'default') => {
    return apiRequest(`/settings?userId=${userId}`);
  },

  // Atualizar configurações
  update: async (settingsData: any, userId = 'default') => {
    return apiRequest('/settings', {
      method: 'PUT',
      body: JSON.stringify({ ...settingsData, userId }),
    });
  },

  // Resetar configurações para padrão
  reset: async (userId = 'default') => {
    return apiRequest(`/settings?userId=${userId}`, {
      method: 'DELETE',
    });
  },
};

// Health check
export const healthCheck = async () => {
  return apiRequest('/health');
};