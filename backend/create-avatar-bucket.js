/**
 * Script untuk membuat bucket avatars di Supabase Storage via SQL
 * Jalankan: node create-avatar-bucket.js
 */
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function createBucket() {
  console.log('Mencoba membuat bucket avatars...');
  console.log('URL:', supabaseUrl);

  // Coba via SQL
  const { data, error } = await supabase.rpc('create_storage_bucket', {
    bucket_name: 'avatars',
    is_public: true
  });

  console.log('RPC result:', { data, error: error?.message });

  // Coba langsung
  const result = await supabase.storage.createBucket('avatars', {
    public: true,
    fileSizeLimit: 5 * 1024 * 1024,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  });

  console.log('createBucket result:', result.error ? result.error.message : 'BERHASIL!');
}

createBucket();
