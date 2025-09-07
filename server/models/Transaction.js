const { v4: uuidv4 } = require('uuid');
const database = require('../database/database');

class Transaction {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.user_id = data.user_id || 'default';
    this.type = data.type;
    this.amount = data.amount;
    this.description = data.description;
    this.category = data.category;
    this.date = data.date;
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
        `INSERT INTO transactions (id, user_id, type, amount, description, category, date, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [this.id, this.user_id, this.type, this.amount, this.description, this.category, this.date, now, now],
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
         SET type = ?, amount = ?, description = ?, category = ?, date = ?, updated_at = ?
         WHERE id = ? AND user_id = ?`,
        [this.type, this.amount, this.description, this.category, this.date, now, this.id, this.user_id],
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
}

module.exports = Transaction;