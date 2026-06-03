/**
 * Verifikasi Supabase Storage — jalankan setelah SQL dijalankan di Dashboard
 * node verify-storage.js
 */
require('dotenv').config();
const https = require('https');
const fs = require('fs');
const path = require('path');

function httpsRequest(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const raw = Buffer.concat(chunks).toString();
        let parsed; try { parsed = JSON.parse(raw); } catch { parsed = raw; }
        resolve({ status: res.statusCode, data: parsed });
      });
    });
    req.on('error', reject);
    req.setTimeout(10000, () => { req.destroy(); reject(new Error('Timeout')); });
    if (body) req.write(body);
    req.end();
  });
}

const host = new URL(process.env.SUPABASE_URL).hostname;
const key = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY;
const baseUrl = process.env.SUPABASE_URL;

async function checkBucket(name) {
  const r = await httpsRequest({
    hostname: host, path: `/storage/v1/bucket/${name}`, method: 'GET',
    headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
  });
  return r.status === 200;
}

async function testUpload(bucket, folder) {
  const buf = Buffer.from(`test-${Date.now()}`);
  const fileName = `${folder}/verify-test-${Date.now()}.txt`;

  const upload = await httpsRequest({
    hostname: host, path: `/storage/v1/object/${bucket}/${fileName}`, method: 'POST',
    headers: {
      'apikey': key, 'Authorization': `Bearer ${key}`,
      'Content-Type': 'text/plain', 'Content-Length': buf.length
    }
  }, buf);

  if (upload.status === 200 || upload.status === 201) {
    const url = `${baseUrl}/storage/v1/object/public/${bucket}/${fileName}`;
    // cleanup
    const body = JSON.stringify({ prefixes: [fileName] });
    await httpsRequest({
      hostname: host, path: `/storage/v1/object/${bucket}`, method: 'DELETE',
      headers: {
        'apikey': key, 'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body)
      }
    }, body);
    return { ok: true, url };
  }
  return { ok: false, error: JSON.stringify(upload.data) };
}

async function main() {
  console.log('🔍 Verifikasi Supabase Storage...\n');

  const buckets = [
    { name: 'avatars', folder: 'profile' },
    { name: 'services', folder: 'images' },
    { name: 'order-results', folder: 'order-999' },
  ];

  let allOk = true;

  for (const { name, folder } of buckets) {
    process.stdout.write(`Bucket '${name}': `);
    const exists = await checkBucket(name);
    if (!exists) {
      console.log('❌ TIDAK ADA — jalankan SQL setup terlebih dahulu!');
      allOk = false;
      continue;
    }

    // Test upload
    const result = await testUpload(name, folder);
    if (result.ok) {
      console.log(`✅ ADA & BISA UPLOAD`);
    } else {
      console.log(`⚠️  ADA tapi GAGAL UPLOAD: ${result.error}`);
      allOk = false;
    }
  }

  console.log('');
  if (allOk) {
    console.log('🎉 Semua bucket siap! Upload gambar sekarang sudah bisa ke Supabase Storage.');
  } else {
    console.log('❌ Ada bucket yang bermasalah. Jalankan SQL dari setup-storage-supabase.sql di Supabase Dashboard > SQL Editor.');
  }
}

main().catch(err => console.error('Error:', err.message));
