/**
 * Supabase Storage Utility — menggunakan native https Node.js
 * (Workaround untuk masalah fetch failed di Node.js v24 + supabase-js v2)
 */
const https = require('https');
const { URL } = require('url');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️  SUPABASE_URL atau SUPABASE_KEY tidak ditemukan di .env');
}

const BUCKETS = {
  AVATARS: 'avatars',
  SERVICES: 'services',
  ORDER_RESULTS: 'order-results',
  CHAT_FILES: 'chat-files',
};

// ─── HELPER: request HTTPS ke Supabase Storage ───────────────────────────────

function httpsRequest(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        const raw = Buffer.concat(chunks).toString();
        let parsed;
        try { parsed = JSON.parse(raw); } catch { parsed = raw; }
        resolve({ status: res.statusCode, data: parsed, headers: res.headers });
      });
    });
    req.on('error', reject);
    req.setTimeout(30000, () => { req.destroy(); reject(new Error('Request timeout')); });
    if (body) req.write(body);
    req.end();
  });
}

function getSupabaseHost() {
  return new URL(supabaseUrl).hostname;
}

// ─── CORE UPLOAD ─────────────────────────────────────────────────────────────

/**
 * Upload buffer file ke Supabase Storage via HTTPS langsung
 */
async function uploadToSupabase(fileBuffer, originalName, bucket, folder = '') {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase belum dikonfigurasi. Pastikan SUPABASE_URL dan SUPABASE_KEY ada di .env');
  }

  const ext = (originalName.split('.').pop() || 'jpg').toLowerCase();
  const prefix = folder ? `${folder}/` : '';
  const uniqueName = `${prefix}${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
  const contentType = getMimeType(ext);

  const path = `/storage/v1/object/${bucket}/${uniqueName}`;

  const options = {
    hostname: getSupabaseHost(),
    path,
    method: 'POST',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': contentType,
      'Content-Length': fileBuffer.length,
      'x-upsert': 'false',
    },
  };

  const result = await httpsRequest(options, fileBuffer);

  if (result.status !== 200 && result.status !== 201) {
    const errMsg = typeof result.data === 'object' ? (result.data?.error || result.data?.message || JSON.stringify(result.data)) : result.data;
    console.error(`Supabase Storage [${bucket}] upload error (${result.status}):`, errMsg);
    throw new Error(`Gagal upload ke Supabase Storage (${bucket}): ${errMsg}`);
  }

  // Public URL
  const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${uniqueName}`;

  return {
    url: publicUrl,
    path: uniqueName,
  };
}

// ─── CORE DELETE ─────────────────────────────────────────────────────────────

async function deleteFromSupabase(fileUrl, bucket) {
  if (!fileUrl || !fileUrl.includes('supabase')) return;

  try {
    const marker = `/storage/v1/object/public/${bucket}/`;
    const urlParts = fileUrl.split(marker);
    if (urlParts.length < 2) return;

    const filePath = decodeURIComponent(urlParts[1]);
    const body = JSON.stringify({ prefixes: [filePath] });

    const options = {
      hostname: getSupabaseHost(),
      path: `/storage/v1/object/${bucket}`,
      method: 'DELETE',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const result = await httpsRequest(options, body);
    if (result.status >= 400) {
      console.warn(`Gagal menghapus dari [${bucket}]:`, result.data);
    }
  } catch (err) {
    console.warn(`Error saat menghapus dari Supabase [${bucket}]:`, err.message);
  }
}

// ─── CERATE BUCKET ────────────────────────────────────────────────────────────

async function createBucketIfNotExists(name, isPublic = true, fileSizeLimitMB = 10) {
  // Cek dulu apakah sudah ada
  const checkOptions = {
    hostname: getSupabaseHost(),
    path: `/storage/v1/bucket/${name}`,
    method: 'GET',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
    },
  };

  const check = await httpsRequest(checkOptions);
  if (check.status === 200) {
    console.log(`✅ Bucket '${name}' sudah ada.`);
    return true;
  }

  // Buat bucket baru
  const body = JSON.stringify({
    id: name,
    name,
    public: isPublic,
    file_size_limit: fileSizeLimitMB * 1024 * 1024,
  });

  const options = {
    hostname: getSupabaseHost(),
    path: '/storage/v1/bucket',
    method: 'POST',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
    },
  };

  const result = await httpsRequest(options, body);
  if (result.status === 200 || result.status === 201) {
    console.log(`✅ Bucket '${name}' berhasil dibuat.`);
    return true;
  } else {
    const msg = typeof result.data === 'object' ? (result.data?.error || result.data?.message || JSON.stringify(result.data)) : result.data;
    console.warn(`⚠️  Gagal membuat bucket '${name}': ${msg}`);
    console.warn(`   → Jalankan SQL di setup-storage-supabase.sql di Supabase Dashboard > SQL Editor`);
    return false;
  }
}

// ─── AVATAR ───────────────────────────────────────────────────────────────────

async function uploadAvatarToSupabase(fileBuffer, originalName) {
  return uploadToSupabase(fileBuffer, originalName, BUCKETS.AVATARS, 'profile');
}

async function deleteAvatarFromSupabase(fileUrl) {
  return deleteFromSupabase(fileUrl, BUCKETS.AVATARS);
}

// ─── SERVICE IMAGES ───────────────────────────────────────────────────────────

async function uploadServiceImageToSupabase(fileBuffer, originalName) {
  return uploadToSupabase(fileBuffer, originalName, BUCKETS.SERVICES, 'images');
}

async function uploadMultipleServiceImages(files) {
  if (!files || files.length === 0) return [];
  const results = await Promise.all(
    files.map(f => uploadServiceImageToSupabase(f.buffer, f.originalname))
  );
  return results.map(r => r.url);
}

async function deleteServiceImageFromSupabase(fileUrl) {
  return deleteFromSupabase(fileUrl, BUCKETS.SERVICES);
}

// ─── ORDER RESULTS ────────────────────────────────────────────────────────────

async function uploadOrderResultToSupabase(fileBuffer, originalName, orderId) {
  return uploadToSupabase(fileBuffer, originalName, BUCKETS.ORDER_RESULTS, `order-${orderId}`);
}

async function deleteOrderResultFromSupabase(fileUrl) {
  return deleteFromSupabase(fileUrl, BUCKETS.ORDER_RESULTS);
}

// ─── CHAT FILES ───────────────────────────────────────────────────────────────

async function uploadChatFileToSupabase(fileBuffer, originalName) {
  return uploadToSupabase(fileBuffer, originalName, BUCKETS.CHAT_FILES, 'chat');
}

async function deleteChatFileFromSupabase(fileUrl) {
  return deleteFromSupabase(fileUrl, BUCKETS.CHAT_FILES);
}

// ─── ENSURE BUCKETS ───────────────────────────────────────────────────────────

async function ensureAllBucketsExist() {
  try {
    await createBucketIfNotExists(BUCKETS.AVATARS, true, 5);
    await createBucketIfNotExists(BUCKETS.SERVICES, true, 10);
    await createBucketIfNotExists(BUCKETS.ORDER_RESULTS, true, 50);
    await createBucketIfNotExists(BUCKETS.CHAT_FILES, true, 20);
  } catch (err) {
    console.warn('⚠️  Error saat setup bucket:', err.message);
  }
}

const ensureAvatarsBucketExists = ensureAllBucketsExist;

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function getMimeType(ext) {
  const map = {
    jpg: 'image/jpeg', jpeg: 'image/jpeg',
    png: 'image/png', gif: 'image/gif', webp: 'image/webp',
    pdf: 'application/pdf', zip: 'application/zip',
    mp4: 'video/mp4', mov: 'video/quicktime',
  };
  return map[ext] || 'application/octet-stream';
}

module.exports = {
  BUCKETS,
  uploadAvatarToSupabase,
  deleteAvatarFromSupabase,
  uploadServiceImageToSupabase,
  uploadMultipleServiceImages,
  deleteServiceImageFromSupabase,
  uploadOrderResultToSupabase,
  deleteOrderResultFromSupabase,
  uploadChatFileToSupabase,
  deleteChatFileFromSupabase,
  ensureAllBucketsExist,
  ensureAvatarsBucketExists,
};
