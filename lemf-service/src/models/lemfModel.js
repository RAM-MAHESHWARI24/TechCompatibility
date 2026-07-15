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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by INT NULL
      );
    `;
    try {
      await db.query(query);
      console.log('lemf_records table initialized successfully.');
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
