const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

class DatabaseMigration {
  constructor() {
    this.db = null;
  }

  async connect() {
    return new Promise((resolve, reject) => {
      const dbPath = path.join(__dirname, 'financial.db');
      
      if (!fs.existsSync(dbPath)) {
        console.log('Banco de dados não existe, não é necessário migrar');
        resolve();
        return;
      }

      this.db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          console.error('Erro ao conectar com o banco de dados:', err);
          reject(err);
        } else {
          console.log('✅ Conectado ao banco para migração');
          resolve();
        }
      });
    });
  }

  async checkColumnExists(tableName, columnName) {
    return new Promise((resolve, reject) => {
      this.db.all(`PRAGMA table_info(${tableName})`, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          const columnExists = rows.some(row => row.name === columnName);
          resolve(columnExists);
        }
      });
    });
  }

  async migrate() {
    try {
      await this.connect();
      
      // Verificar se a coluna recurring_count existe
      const hasRecurringCount = await this.checkColumnExists('transactions', 'recurring_count');
      
      if (hasRecurringCount) {
        console.log('🔄 Migrando coluna recurring_count para recurring_end_date...');
        
        // Adicionar coluna recurring_end_date se não existir
        const hasRecurringEndDate = await this.checkColumnExists('transactions', 'recurring_end_date');
        
        if (!hasRecurringEndDate) {
          await this.runQuery('ALTER TABLE transactions ADD COLUMN recurring_end_date DATE');
          console.log('✅ Coluna recurring_end_date adicionada');
        }
        
        // Remover coluna recurring_count
        await this.runQuery('ALTER TABLE transactions DROP COLUMN recurring_count');
        console.log('✅ Coluna recurring_count removida');
        
        console.log('✅ Migração concluída com sucesso!');
      } else {
        console.log('✅ Banco já está atualizado, não é necessário migrar');
      }
      
    } catch (error) {
      console.error('❌ Erro durante a migração:', error);
      throw error;
    } finally {
      if (this.db) {
        this.db.close();
      }
    }
  }

  async runQuery(query) {
    return new Promise((resolve, reject) => {
      this.db.run(query, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}

// Executar migração se chamado diretamente
if (require.main === module) {
  const migration = new DatabaseMigration();
  migration.migrate()
    .then(() => {
      console.log('🎉 Migração finalizada!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Falha na migração:', error);
      process.exit(1);
    });
}

module.exports = DatabaseMigration;