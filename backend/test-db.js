const { query, getConnection } = require('./config/database');
require('dotenv').config();

async function testConnection() {
  let connection;

  try {
    console.log('Testing Supabase PostgreSQL database connection...');

    // TestgetConnection
    connection = await getConnection();
    console.log('✅ Database connection pooler handshake successful!');

    // Test a simple query
    const rows = await query('SELECT 1 as test');
    console.log('✅ Query execution successful:', rows);

    // Check if tables exist
    const tables = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('📋 Available tables:', tables.map(row => row.table_name));

    console.log('🎉 Supabase database setup is 100% ready!');

  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('\n🔧 Please check your .env configuration:');
    if (process.env.DATABASE_URL) {
      console.log('- DATABASE_URL:', process.env.DATABASE_URL.replace(/:([^:@]+)@/, ':***@'));
    } else {
      console.log('- DB_HOST:', process.env.DB_HOST);
      console.log('- DB_USER:', process.env.DB_USER);
      console.log('- DB_PASSWORD:', process.env.DB_PASSWORD ? '***' : 'NOT SET');
      console.log('- DB_NAME:', process.env.DB_NAME);
      console.log('- DB_PORT:', process.env.DB_PORT || 6543);
    }
    process.exit(1);
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

// Run if called directly
if (require.main === module) {
  testConnection();
}

module.exports = testConnection;