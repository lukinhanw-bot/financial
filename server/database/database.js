const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

class Database {
  constructor() {
    this.db = null;
  }

  async connect() {
    return new Promise((resolve, reject) => {
      // Criar diretório se não existir
      const dbDir = path.dirname(path.join(__dirname, 'financial.db'));
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      this.db = new sqlite3.Database(path.join(__dirname, 'financial.db'), sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
        if (err) {
          console.error('Erro ao conectar com o banco de dados:', err);
          reject(err);
        } else {
          console.log('✅ Conectado ao banco SQLite');
          this.initializeDatabase().then(resolve).catch(reject);
        }
      });
    });
  }

  async initializeDatabase() {
    return new Promise((resolve, reject) => {
      const schemaPath = path.join(__dirname, 'schema.sql');
      const schema = fs.readFileSync(schemaPath, 'utf8');
      
      this.db.exec(schema, (err) => {
        if (err) {
          console.error('Erro ao inicializar schema:', err);
          reject(err);
        } else {
          console.log('✅ Schema do banco inicializado');
          this.seedDefaultCategories().then(resolve).catch(reject);
        }
      });
    });
  }

  async seedDefaultCategories() {
    return new Promise((resolve, reject) => {
      // Verificar se já existem categorias padrão
      this.db.get("SELECT COUNT(*) as count FROM categories WHERE user_id = 'default'", (err, row) => {
        if (err) {
          reject(err);
          return;
        }

        if (row.count > 0) {
          resolve();
          return;
        }

        // Inserir categorias padrão
        const defaultCategories = [
          // Receitas
          { id: '1', name: 'Salário', icon: 'Briefcase', color: '#10B981', type: 'income' },
          { id: '2', name: 'Freelancer', icon: 'Code', color: '#059669', type: 'income' },
          { id: '3', name: 'Vendas', icon: 'ShoppingBag', color: '#0D9488', type: 'income' },
          { id: '4', name: 'Investimentos', icon: 'TrendingUp', color: '#0F766E', type: 'income' },
          
          // Gastos
          { id: '5', name: 'Alimentação', icon: 'UtensilsCrossed', color: '#EF4444', type: 'expense' },
          { id: '6', name: 'Transporte', icon: 'Car', color: '#DC2626', type: 'expense' },
          { id: '7', name: 'Moradia', icon: 'Home', color: '#B91C1C', type: 'expense' },
          { id: '8', name: 'Entretenimento', icon: 'Gamepad2', color: '#991B1B', type: 'expense' },
          { id: '9', name: 'Saúde', icon: 'Heart', color: '#7F1D1D', type: 'expense' },
          { id: '10', name: 'Compras', icon: 'ShoppingCart', color: '#F59E0B', type: 'expense' },
        ];

        const stmt = this.db.prepare(`
          INSERT INTO categories (id, user_id, name, icon, color, type)
          VALUES (?, 'default', ?, ?, ?, ?)
        `);

        let completed = 0;
        defaultCategories.forEach(category => {
          stmt.run([category.id, category.name, category.icon, category.color, category.type], (err) => {
            if (err) {
              console.error('Erro ao inserir categoria padrão:', err);
            }
            completed++;
            if (completed === defaultCategories.length) {
              stmt.finalize();
              console.log('✅ Categorias padrão inseridas');
              resolve();
            }
          });
        });
      });
    });
  }

  getDb() {
    return this.db;
  }

  close() {
    if (this.db) {
      this.db.close((err) => {
        if (err) {
          console.error('Erro ao fechar banco:', err);
        } else {
          console.log('✅ Conexão com banco fechada');
        }
      });
    }
  }
}

module.exports = new Database();