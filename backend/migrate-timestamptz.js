const { Client } = require('pg');
require('dotenv').config();

async function runMigration() {
  console.log('🔄 Menghubungkan ke Supabase PostgreSQL untuk migrasi tipe TIMESTAMPTZ...');

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

  const queries = [
    // users
    "ALTER TABLE users ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at AT TIME ZONE 'UTC'",
    "ALTER TABLE users ALTER COLUMN updated_at TYPE TIMESTAMPTZ USING updated_at AT TIME ZONE 'UTC'",
    
    // seller_profiles
    "ALTER TABLE seller_profiles ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at AT TIME ZONE 'UTC'",
    "ALTER TABLE seller_profiles ALTER COLUMN updated_at TYPE TIMESTAMPTZ USING updated_at AT TIME ZONE 'UTC'",
    
    // categories
    "ALTER TABLE categories ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at AT TIME ZONE 'UTC'",
    
    // services
    "ALTER TABLE services ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at AT TIME ZONE 'UTC'",
    "ALTER TABLE services ALTER COLUMN updated_at TYPE TIMESTAMPTZ USING updated_at AT TIME ZONE 'UTC'",
    
    // service_packages
    "ALTER TABLE service_packages ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at AT TIME ZONE 'UTC'",
    
    // portfolios
    "ALTER TABLE portfolios ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at AT TIME ZONE 'UTC'",
    
    // orders
    "ALTER TABLE orders ALTER COLUMN started_at TYPE TIMESTAMPTZ USING started_at AT TIME ZONE 'UTC'",
    "ALTER TABLE orders ALTER COLUMN completed_at TYPE TIMESTAMPTZ USING completed_at AT TIME ZONE 'UTC'",
    "ALTER TABLE orders ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at AT TIME ZONE 'UTC'",
    "ALTER TABLE orders ALTER COLUMN updated_at TYPE TIMESTAMPTZ USING updated_at AT TIME ZONE 'UTC'",
    
    // payments
    "ALTER TABLE payments ALTER COLUMN verified_at TYPE TIMESTAMPTZ USING verified_at AT TIME ZONE 'UTC'",
    "ALTER TABLE payments ALTER COLUMN released_at TYPE TIMESTAMPTZ USING released_at AT TIME ZONE 'UTC'",
    "ALTER TABLE payments ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at AT TIME ZONE 'UTC'",
    "ALTER TABLE payments ALTER COLUMN updated_at TYPE TIMESTAMPTZ USING updated_at AT TIME ZONE 'UTC'",
    
    // chats
    "ALTER TABLE chats ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at AT TIME ZONE 'UTC'",
    
    // notifications
    "ALTER TABLE notifications ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at AT TIME ZONE 'UTC'",
    
    // reviews
    "ALTER TABLE reviews ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at AT TIME ZONE 'UTC'",
    
    // withdraws
    "ALTER TABLE withdraws ALTER COLUMN approved_at TYPE TIMESTAMPTZ USING approved_at AT TIME ZONE 'UTC'",
    "ALTER TABLE withdraws ALTER COLUMN processed_at TYPE TIMESTAMPTZ USING processed_at AT TIME ZONE 'UTC'",
    "ALTER TABLE withdraws ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at AT TIME ZONE 'UTC'",
    "ALTER TABLE withdraws ALTER COLUMN updated_at TYPE TIMESTAMPTZ USING updated_at AT TIME ZONE 'UTC'",
    
    // reports
    "ALTER TABLE reports ALTER COLUMN handled_at TYPE TIMESTAMPTZ USING handled_at AT TIME ZONE 'UTC'",
    "ALTER TABLE reports ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at AT TIME ZONE 'UTC'",
    "ALTER TABLE reports ALTER COLUMN updated_at TYPE TIMESTAMPTZ USING updated_at AT TIME ZONE 'UTC'"
  ];

  try {
    await client.connect();
    console.log('✅ Terhubung ke Supabase PostgreSQL!');

    console.log('🚀 Menjalankan SQL ALTER TABLE untuk tipe data TIMESTAMPTZ...');
    for (const sql of queries) {
      console.log(`Executing: ${sql}`);
      await client.query(sql);
    }

    console.log('🎉 Semua kolom TIMESTAMP berhasil diubah ke TIMESTAMPTZ!');
  } catch (error) {
    console.error('❌ Gagal melakukan migrasi TIMESTAMPTZ:', error.message);
  } finally {
    await client.end();
  }
}

runMigration();
