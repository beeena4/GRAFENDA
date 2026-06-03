/**
 * Script setup Supabase Storage untuk foto profil
 * Jalankan dengan: node setup-supabase-storage.js
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ SUPABASE_URL atau SUPABASE_SERVICE_KEY tidak ditemukan di .env');
  console.error('   Tambahkan ke file backend/.env:');
  console.error('   SUPABASE_URL=https://your-project.supabase.co');
  console.error('   SUPABASE_SERVICE_KEY=your-service-role-key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupStorage() {
  console.log('🔄 Memeriksa Supabase Storage...');

  // Cek apakah bucket 'avatars' sudah ada
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();

  if (listError) {
    console.error('❌ Gagal mengambil daftar bucket:', listError.message);
    console.error('   Pastikan SUPABASE_SERVICE_KEY sudah benar (service_role key, bukan anon key)');
    process.exit(1);
  }

  const avatarBucketExists = buckets?.some(b => b.name === 'avatars');

  if (avatarBucketExists) {
    console.log('✅ Bucket "avatars" sudah ada!');
  } else {
    console.log('📦 Membuat bucket "avatars"...');
    const { error: createError } = await supabase.storage.createBucket('avatars', {
      public: true,
      fileSizeLimit: 5 * 1024 * 1024, // 5MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    });

    if (createError) {
      console.error('❌ Gagal membuat bucket "avatars":', createError.message);
      process.exit(1);
    }

    console.log('✅ Bucket "avatars" berhasil dibuat!');
  }

  // Test upload sederhana
  console.log('\n🧪 Melakukan test upload...');
  const testBuffer = Buffer.from('test-content');
  const testPath = 'test/test-file.txt';

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(testPath, testBuffer, { upsert: true });

  if (uploadError) {
    console.error('❌ Test upload gagal:', uploadError.message);
    console.error('   Periksa apakah bucket sudah diatur sebagai "public"');
  } else {
    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(uploadData.path);
    console.log('✅ Test upload berhasil!');
    console.log('   Public URL:', urlData.publicUrl);

    // Hapus test file
    await supabase.storage.from('avatars').remove([testPath]);
    console.log('🗑️  Test file dihapus.');
  }

  console.log('\n🎉 Setup Supabase Storage selesai!');
  console.log('   Foto profil akan otomatis tersimpan ke Supabase Storage saat user mengupload avatar.');
}

setupStorage().catch((err) => {
  console.error('❌ Error tidak terduga:', err.message);
  process.exit(1);
});
