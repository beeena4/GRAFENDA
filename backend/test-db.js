const mysql = require('mysql2/promise');
require('dotenv').config();

async function testConnection() {
  let connection;

  try {
    console.log('Testing database connection...');

    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306
    });

    console.log('✅ Database connection successful!');

    // Test a simple query
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('✅ Query execution successful:', rows);

    // Check if tables exist
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('📋 Available tables:', tables.map(row => Object.values(row)[0]));

    console.log('🎉 Database setup is ready!');

  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('\n🔧 Please check your .env configuration:');
    console.log('- DB_HOST:', process.env.DB_HOST);
    console.log('- DB_USER:', process.env.DB_USER);
    console.log('- DB_PASSWORD:', process.env.DB_PASSWORD ? '***' : 'NOT SET');
    console.log('- DB_NAME:', process.env.DB_NAME);
    console.log('- DB_PORT:', process.env.DB_PORT || 3306);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run if called directly
if (require.main === module) {
  testConnection();
}

module.exports = testConnection;