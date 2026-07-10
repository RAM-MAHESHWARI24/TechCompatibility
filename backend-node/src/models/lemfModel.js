const db = require('../config/db');
const bcrypt = require('bcryptjs');

class LemfModel {
  static mapRowToDto(row) {
    if (!row) return null;
    return {
      id: row.id,
      name: row.name,
      category: row.category,
      assignedTo: row.assigned_to,
      notes: row.notes,
      status: row.status,
      createdBy: row.created_by,
    };
  }

  static async initializeTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS lemf_records (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        category VARCHAR(50),
        assigned_to VARCHAR(100),
        notes VARCHAR(500),
        status VARCHAR(20) DEFAULT 'PENDING',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    const loginQuery = `
      CREATE TABLE IF NOT EXISTS lemf_login_details (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL
      );
    `;
    try {
      await db.query(query);
      console.log('lemf_records table initialized successfully.');
      
      await db.query(loginQuery);
      console.log('lemf_login_details table initialized successfully.');

      // Check if created_by column exists
      const [cols] = await db.query(
        "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'lemf_records' AND COLUMN_NAME = 'created_by'"
      );
      if (cols.length === 0) {
        await db.query("ALTER TABLE lemf_records ADD COLUMN created_by INT NULL");
        await db.query("ALTER TABLE lemf_records ADD CONSTRAINT fk_created_by FOREIGN KEY (created_by) REFERENCES lemf_login_details(id) ON DELETE SET NULL");
        console.log("Added created_by column and foreign key constraint successfully.");
      }
      
      const [users] = await db.query('SELECT COUNT(*) as count FROM lemf_login_details');
      if (users[0].count === 0) {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await db.query(
          "INSERT INTO lemf_login_details (username, password) VALUES ('admin', ?)",
          [hashedPassword]
        );
        console.log('Seeded default admin user (username: admin) with hashed password.');
      } else {
        // Migration: check if 'admin' password is plain text and migrate to hash
        const [adminRows] = await db.query("SELECT * FROM lemf_login_details WHERE username = 'admin'");
        if (adminRows.length > 0) {
          const adminUser = adminRows[0];
          const isHashed = adminUser.password.startsWith('$2a$') || adminUser.password.startsWith('$2b$') || adminUser.password.startsWith('$2y$');
          if (!isHashed) {
            const hashedPassword = await bcrypt.hash(adminUser.password, 10);
            await db.query(
              "UPDATE lemf_login_details SET password = ? WHERE id = ?",
              [hashedPassword, adminUser.id]
            );
            console.log('Migrated existing plaintext admin password to hashed format.');
          }
        }
      }
    } catch (err) {
      console.error('Error initializing tables:', err);
      throw err;
    }
  }

  static async findAll() {
    const query = 'SELECT * FROM lemf_records ORDER BY id DESC';
    const [rows] = await db.query(query);
    return rows.map(LemfModel.mapRowToDto);
  }

  static async create(data) {
    const query = `
      INSERT INTO lemf_records (name, category, assigned_to, notes, status, created_by, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      data.name,
      data.category || null,
      data.assignedTo || null,
      data.notes || null,
      data.status || 'PENDING',
      data.createdBy || null,
      new Date()
    ];
    const [result] = await db.query(query, values);
    const insertId = result.insertId;

    // Fetch and return the newly created record
    const [rows] = await db.query('SELECT * FROM lemf_records WHERE id = ?', [insertId]);
    return LemfModel.mapRowToDto(rows[0]);
  }

  static async update(id, data) {
    const query = `
      UPDATE lemf_records 
      SET name = ?, category = ?, assigned_to = ?, notes = ?, status = ?
      WHERE id = ?
    `;
    const values = [
      data.name,
      data.category || null,
      data.assignedTo || null,
      data.notes || null,
      data.status || 'PENDING',
      id
    ];
    const [result] = await db.query(query, values);
    if (result.affectedRows === 0) return null;

    // Fetch and return the updated record
    const [rows] = await db.query('SELECT * FROM lemf_records WHERE id = ?', [id]);
    return LemfModel.mapRowToDto(rows[0]);
  }

  static async delete(id) {
    const query = 'DELETE FROM lemf_records WHERE id = ?';
    const [result] = await db.query(query, [id]);
    return result.affectedRows > 0;
  }
}

module.exports = LemfModel;
