const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
  queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

const query = async (sql, params = []) => {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

const getConnection = async () => {
  return await pool.getConnection();
};

const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database terhubung: MySQL XAMPP siap digunakan.');
    connection.release();
  } catch (err) {
    console.error('❌ Gagal terhubung ke MySQL XAMPP:', err.message);
  }
};

testConnection();

module.exports = {
  query,
  getConnection,
  pool
};