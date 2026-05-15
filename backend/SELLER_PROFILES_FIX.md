# 🔧 Perbaikan: Table seller_profiles Tidak Ada

## ❌ Masalah
Saat mendaftar freelancer, muncul error:
```
Table 'grafenda.seller_profiles' doesn't exist
```

## ✅ SOLUSI CEPAT (3 Langkah)

### **Langkah 1: Setup Database**
1. Buka folder `backend/`
2. Double-click **`init-db.bat`** (Windows)
   - atau jalankan `node setup-tables.js` (macOS/Linux)
3. Tunggu hingga selesai ✅

### **Langkah 2: Verifikasi di phpMyAdmin**
1. Buka browser → `http://localhost/phpmyadmin`
2. Login dengan user: `root` (password kosong)
3. Cek database `grafenda`:
   - ✅ Table `seller_profiles` sudah ada
   - ✅ Table `categories` sudah ada
   - ✅ Table `services` sudah ada

### **Langkah 3: Test Registrasi**
1. Refresh browser dan buka: `http://localhost:5173/register-seller`
2. Isi form lengkap:
   - Nama Lengkap: `John Doe`
   - Email: `john@gmail.com`
   - Keahlian: `Design Grafis`
   - Password: `password123`
3. Click "Daftar sebagai Freelancer"
4. Seharusnya berhasil ✅

---

## 📋 Apa yang Diperbaiki

### **Backend Models** (SellerProfile.js)
- ✅ Fixed JOIN query: `users.user_id` (bukan `users.id`)
- ✅ Fixed `findByUserId()` query
- ✅ Fixed `getTopSellers()` query

### **Database Setup** (setup-tables.js)
- ✅ Membuat table `seller_profiles` otomatis
- ✅ Membuat table `categories` dengan default data
- ✅ Membuat table `services` dan `service_packages`
- ✅ Menggunakan foreign key yang benar ke `users(user_id)`

### **Frontend** (RegisterSeller.tsx)
- ✅ Sudah terhubung ke API backend
- ✅ Sudah menyimpan token ke localStorage

---

## 🆘 Jika Masih Belum Berhasil

### Opsi 1: Setup Manual via phpMyAdmin
1. Buka phpMyAdmin → `http://localhost/phpmyadmin`
2. Pilih database `grafenda`
3. Click tab **SQL**
4. Buka file `backend/setup-tables.sql`
5. Copy-paste semua query SQL
6. Click "Execute"

### Opsi 2: Lihat Error di Console
1. Buka Backend Terminal (npm run dev)
2. Lihat error message yang muncul
3. Lapor error message tersebut untuk debugging lebih lanjut

### Opsi 3: Reset Ulang
```bash
# Hapus database lama
mysql -u root -p -e "DROP DATABASE IF EXISTS grafenda;"

# Buat database baru
mysql -u root -p -e "CREATE DATABASE grafenda;"

# Setup tabel
cd backend
node setup-tables.js
```

---

## 📁 File yang Relevan

| File | Fungsi |
|------|--------|
| `init-db.bat` | Quick setup untuk Windows |
| `setup-tables.js` | Node script untuk setup otomatis |
| `setup-tables.sql` | SQL manual (untuk phpMyAdmin) |
| `models/SellerProfile.js` | Fixed model queries |
| `pages/RegisterSeller.tsx` | Frontend registration form |

---

## ✨ Checklist Verifikasi

- [ ] Jalankan `init-db.bat` atau `node setup-tables.js`
- [ ] Lihat di phpMyAdmin → database `grafenda` punya table:
  - [ ] `seller_profiles`
  - [ ] `categories`
  - [ ] `services`
  - [ ] `service_packages`
- [ ] Test registrasi di `http://localhost:5173/register-seller`
- [ ] Cek database → table `users` dan `seller_profiles` punya data baru

---

**Jika sudah berhasil, selamat! 🎉 Registrasi freelancer sekarang sudah berfungsi.**
