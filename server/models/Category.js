const { v4: uuidv4 } = require('uuid');
const database = require('../database/database');

class Category {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.user_id = data.user_id || 'default';
    this.name = data.name;
    this.icon = data.icon;
    this.color = data.color;
    this.type = data.type;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  static async findAll(userId = 'default') {
    return new Promise((resolve, reject) => {
      const db = database.getDb();
      db.all(
        'SELECT * FROM categories WHERE user_id = ? OR user_id = "default" ORDER BY type, name',
        [userId],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows.map(row => new Category(row)));
          }
        }
      );
    });
  }

  static async findById(id, userId = 'default') {
    return new Promise((resolve, reject) => {
      const db = database.getDb();
      db.get(
        'SELECT * FROM categories WHERE id = ? AND (user_id = ? OR user_id = "default")',
        [id, userId],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row ? new Category(row) : null);
          }
        }
      );
    });
  }

  static async findByType(type, userId = 'default') {
    return new Promise((resolve, reject) => {
      const db = database.getDb();
      db.all(
        'SELECT * FROM categories WHERE type = ? AND (user_id = ? OR user_id = "default") ORDER BY name',
        [type, userId],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows.map(row => new Category(row)));
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
        `INSERT INTO categories (id, user_id, name, icon, color, type, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [this.id, this.user_id, this.name, this.icon, this.color, this.type, now, now],
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
        `UPDATE categories 
         SET name = ?, icon = ?, color = ?, type = ?, updated_at = ?
         WHERE id = ? AND user_id = ?`,
        [this.name, this.icon, this.color, this.type, now, this.id, this.user_id],
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
      
      // Não permitir deletar categorias padrão
      db.get('SELECT user_id FROM categories WHERE id = ?', [id], (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        
        if (row && row.user_id === 'default') {
          reject(new Error('Não é possível deletar categorias padrão'));
          return;
        }
        
        db.run(
          'DELETE FROM categories WHERE id = ? AND user_id = ?',
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
    });
  }
}

module.exports = Category;