const crypto = require('crypto');
const database = require('../database/database');

class Settings {
  constructor(data) {
    this.id = data.id || crypto.randomUUID();
    this.user_id = data.user_id || 'default';
    this.initial_balance = data.initial_balance || 0;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  static async findByUserId(userId = 'default') {
    return new Promise((resolve, reject) => {
      const db = database.getDb();
      db.get(
        'SELECT * FROM settings WHERE user_id = ?',
        [userId],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row ? new Settings(row) : null);
          }
        }
      );
    });
  }

  async save() {
    return new Promise((resolve, reject) => {
      const db = database.getDb();
      const now = new Date().toISOString();
      
      // Verifica se já existe configuração para o usuário
      db.get(
        'SELECT id FROM settings WHERE user_id = ?',
        [this.user_id],
        (err, existing) => {
          if (err) {
            reject(err);
            return;
          }

          if (existing) {
            // Atualiza configuração existente
            db.run(
              `UPDATE settings 
               SET initial_balance = ?, updated_at = ?
               WHERE user_id = ?`,
              [this.initial_balance, now, this.user_id],
              function(err) {
                if (err) {
                  reject(err);
                } else {
                  resolve(this.changes);
                }
              }
            );
          } else {
            // Cria nova configuração
            db.run(
              `INSERT INTO settings (id, user_id, initial_balance, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?)`,
              [this.id, this.user_id, this.initial_balance, now, now],
              function(err) {
                if (err) {
                  reject(err);
                } else {
                  resolve(this.lastID);
                }
              }
            );
          }
        }
      );
    });
  }

  static async delete(userId = 'default') {
    return new Promise((resolve, reject) => {
      const db = database.getDb();
      db.run(
        'DELETE FROM settings WHERE user_id = ?',
        [userId],
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

module.exports = Settings;
