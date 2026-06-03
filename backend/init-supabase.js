const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function initSupabase() {
  console.log('🔄 Menghubungkan ke Supabase PostgreSQL...');

  const config = {
    ssl: { rejectUnauthorized: false }
  };

  if (process.env.DATABASE_URL) {
    config.connectionString = process.env.DATABASE_URL;
  } else {
    config.host = process.env.DB_HOST;
    config.user = process.env.DB_USER;
    config.password = process.env.DB_PASSWORD;
    config.database = process.env.DB_NAME;
    config.port = parseInt(process.env.DB_PORT) || 5432;
  }

  const client = new Client(config);

  try {
    await client.connect();
    console.log('✅ Terhubung ke Supabase PostgreSQL!');

    console.log('📖 Membaca database_schema_pg.sql...');
    const schemaPath = path.join(__dirname, 'database_schema_pg.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    console.log('🚀 Menjalankan migrasi database di Supabase...');
    await client.query(sql);

    console.log('🎉 Migrasi Supabase database berhasil diselesaikan!');
  } catch (error) {
    console.error('❌ Gagal melakukan inisialisasi database Supabase:', error.message);
    console.log('\n🔧 Silakan periksa konfigurasi .env Anda:');
    if (process.env.DATABASE_URL) {
      console.log('- DATABASE_URL:', process.env.DATABASE_URL.replace(/:([^:@]+)@/, ':***@'));
    } else {
      console.log('- DB_HOST:', process.env.DB_HOST);
      console.log('- DB_USER:', process.env.DB_USER);
      console.log('- DB_PASSWORD:', process.env.DB_PASSWORD ? '***' : 'TIDAK DIATUR');
      console.log('- DB_NAME:', process.env.DB_NAME);
      console.log('- DB_PORT:', process.env.DB_PORT || 5432);
    }
  } finally {
    await client.end();
  }
}

initSupabase();
