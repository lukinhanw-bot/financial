const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

class DatabaseMigration {
  constructor() {
    this.db = null;
  }

  async connect() {
    return new Promise((resolve, reject) => {
      const dbPath = path.join(__dirname, 'financial.db');
      const schemaPath = path.join(__dirname, 'schema.sql');
      
      this.db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
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

  async initializeDatabase() {
    return new Promise((resolve, reject) => {
      const schemaPath = path.join(__dirname, 'schema.sql');
      
      if (!fs.existsSync(schemaPath)) {
        reject(new Error('Arquivo schema.sql não encontrado'));
        return;
      }

      const schema = fs.readFileSync(schemaPath, 'utf8');
      
      this.db.exec(schema, (err) => {
        if (err) {
          console.error('Erro ao criar tabelas:', err);
          reject(err);
        } else {
          console.log('✅ Tabelas criadas com sucesso');
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
      const dbPath = path.join(__dirname, 'financial.db');
      const dbExists = fs.existsSync(dbPath);
      
      await this.connect();
      
      // Se o banco não existe, criar as tabelas
      if (!dbExists) {
        console.log('🔄 Banco de dados não existe, criando tabelas...');
        await this.initializeDatabase();
        console.log('✅ Banco de dados inicializado com sucesso!');
        
        // Configurar permissões após criar o banco
        try {
          await this.setDatabasePermissions();
        } catch (permError) {
          console.warn('⚠️  Aviso: Não foi possível configurar permissões automaticamente:', permError.message);
          console.log('💡 Execute manualmente: ./set-permissions.sh');
        }
        return;
      }
      
      // Verificar se a coluna recurring_count existe
      const hasRecurringCount = await this.checkColumnExists('transactions', 'recurring_count');
      const hasReceived = await this.checkColumnExists('transactions', 'received');
      
      let migrationNeeded = false;
      
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
        migrationNeeded = true;
      }
      
      // Adicionar coluna received se não existir
      if (!hasReceived) {
        console.log('🔄 Adicionando coluna received...');
        await this.runQuery('ALTER TABLE transactions ADD COLUMN received BOOLEAN DEFAULT FALSE');
        console.log('✅ Coluna received adicionada');
        migrationNeeded = true;
      }
      
      if (migrationNeeded) {
        console.log('✅ Migração concluída com sucesso!');
      } else {
        console.log('✅ Banco já está atualizado, não é necessário migrar');
      }
      
      // Configurar permissões após migração
      try {
        await this.setDatabasePermissions();
      } catch (permError) {
        console.warn('⚠️  Aviso: Não foi possível configurar permissões automaticamente:', permError.message);
        console.log('💡 Execute manualmente: ./set-permissions.sh');
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

  async setDatabasePermissions() {
    return new Promise((resolve, reject) => {
      const scriptPath = path.join(__dirname, 'set-permissions.sh');
      
      console.log('🔧 Configurando permissões do banco de dados...');
      
      exec(`bash "${scriptPath}"`, (error, stdout, stderr) => {
        if (error) {
          console.error('❌ Erro ao configurar permissões:', error);
          reject(error);
        } else {
          console.log(stdout);
          if (stderr) {
            console.warn('⚠️  Avisos:', stderr);
          }
          console.log('✅ Permissões configuradas com sucesso!');
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