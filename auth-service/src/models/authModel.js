const db = require('../config/db');

class AuthModel {
  static async initializeTable() {
    const bcrypt = require('bcryptjs');
    const loginQuery = `
      CREATE TABLE IF NOT EXISTS lemf_login_details (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL
      );
    `;
    try {
      await db.query(loginQuery);
      console.log('lemf_login_details table initialized successfully.');

      const [users] = await db.query('SELECT COUNT(*) as count FROM lemf_login_details');
      if (users[0].count === 0) {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await db.query(
          "INSERT INTO lemf_login_details (username, password) VALUES ('admin', ?)",
          [hashedPassword]
        );
        console.log('Seeded default admin user.');
      }
    } catch (err) {
      console.error('Error initializing auth tables:', err);
      throw err;
    }
  }

  static async findByUsername(username) {
    const query = 'SELECT * FROM lemf_login_details WHERE username = ?';
    const [rows] = await db.query(query, [username]);
    return rows[0] || null;
  }
}

module.exports = AuthModel;
