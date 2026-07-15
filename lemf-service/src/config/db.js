const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

function parseJdbcUrl(jdbcUrl) {
  if (!jdbcUrl) return null;
  // Format: jdbc:mysql://host:port/database?params
  const match = jdbcUrl.match(/jdbc:mysql:\/\/([^:/]+)(?::(\d+))?\/([^?]+)/);
  if (match) {
    return {
      host: match[1],
      port: match[2] ? parseInt(match[2], 10) : 3306,
      database: match[3],
    };
  }
  return null;
}

const jdbcParsed = parseJdbcUrl(process.env.SPRING_DATASOURCE_URL);

const dbConfig = {
  host: jdbcParsed?.host || process.env.DB_HOST || 'localhost',
  port: jdbcParsed?.port || parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.SPRING_DATASOURCE_USERNAME || process.env.DB_USER || 'pot_user',
  password: process.env.SPRING_DATASOURCE_PASSWORD || process.env.DB_PASSWORD || 'pot_pass',
  database: jdbcParsed?.database || process.env.DB_NAME || 'lemf_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

console.log(`Connecting to database at ${dbConfig.host}:${dbConfig.port}/${dbConfig.database} as ${dbConfig.user}`);

const pool = mysql.createPool(dbConfig);

module.exports = pool;
