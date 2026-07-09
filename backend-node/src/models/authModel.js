const db = require('../config/db');

class AuthModel {
  static async findByUsername(username) {
    const query = 'SELECT * FROM lemf_login_details WHERE username = ?';
    const [rows] = await db.query(query, [username]);
    return rows[0] || null;
  }
}

module.exports = AuthModel;
