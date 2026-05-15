# 🚀 Petunjuk Setup Database Grafenda

## ⚠️ MASALAH YANG DITEMUKAN
Tabel `seller_profiles` belum ada di database. Database belum diinisialisasi dengan schema lengkap.

## ✅ SOLUSI: Jalankan Database Initialization Script

### Untuk Windows:

1. **Pastikan MySQL/XAMPP Running**
   - Buka XAMPP Control Panel
   - Klik tombol "Start" untuk MySQL

2. **Jalankan Script Setup**
   - Buka File Explorer
   - Navigasi ke: `backend/` folder
   - Double-click file `init-db.bat`
   - Script akan secara otomatis membuat semua tabel yang diperlukan

3. **Tunggu sampai selesai**
   - Akan terlihat output yang menunjukkan:
     ```
     ✅ Database setup selesai!
     ```

### Untuk macOS/Linux:

```bash
cd backend
chmod +x init-db.js
node init-db.js
```

## 📋 Apa yang Dilakukan Script

Script ini akan:
1. ✅ Membuat database `grafenda`
2. ✅ Membuat tabel `users`
3. ✅ Membuat tabel `seller_profiles` 
4. ✅ Membuat semua tabel lainnya (services, orders, payments, dll)
5. ✅ Membuat indeks untuk performa
6. ✅ Menambahkan kategori default

## 🔍 Verifikasi Setup

Setelah menjalankan script, buka phpMyAdmin:

1. Buka browser → `http://localhost/phpmyadmin`
2. Login (biasanya user: `root`, password: kosong)
3. Lihat di sidebar kiri → database `grafenda`
4. Verifikasi tabel ada:
   - ✅ users
   - ✅ seller_profiles
   - ✅ services
   - ✅ categories
   - ✅ orders
   - ✅ dll

## 🚀 Setelah Setup Selesai

1. **Start Backend Server**
   ```bash
   cd backend
   npm run dev
   ```
   
2. **Start Frontend** (di terminal lain)
   ```bash
   cd ..
   npm run dev
   ```

3. **Test Registration**
   - Buka: `http://localhost:5173/register-seller`
   - Isi form dan submit
   - Data harus tersimpan ke database

## 🆘 Troubleshooting

### Error: "Can't connect to MySQL server"
- ✅ Pastikan XAMPP/MySQL sedang running
- ✅ Check `.env` file - pastikan DB_HOST, DB_USER, DB_PASSWORD benar

### Error: "Database already exists"
- ✅ Ini tidak masalah - script akan skip dan lanjut ke tabel

### Tabel masih tidak ada
- ✅ Cek di phpMyAdmin apakah database `grafenda` ada
- ✅ Jalankan script lagi
- ✅ Cek console untuk error messages

## 📁 File Penting

- `.env` - Konfigurasi database (jangan edit biasanya)
- `init-db.js` - Script untuk membuat tabel
- `database_schema.sql` - Schema backup (legacy)

---

**Setelah ini, registrasi freelancer seharusnya sudah berfungsi! ✨**
