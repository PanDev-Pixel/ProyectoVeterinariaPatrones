const mysql = require('mysql2/promise');
require('dotenv').config();

class DatabaseSingleton {
  static pool = null;

  static getInstance() {
    if (!DatabaseSingleton.pool) {
      DatabaseSingleton.pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelayMs: 0,
      });
    }

    return DatabaseSingleton.pool;
  }
}

module.exports = DatabaseSingleton.getInstance();
