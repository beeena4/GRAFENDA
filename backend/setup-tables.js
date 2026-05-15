const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  port: parseInt(process.env.DB_PORT) || 3306,
};

const createMissingTables = async () => {
  let connection;
  try {
    console.log('🔄 Menghubungkan ke MySQL...');
    connection = await mysql.createConnection(dbConfig);
    
    const dbName = process.env.DB_NAME || 'grafenda';
    
    console.log(`✅ Terhubung ke MySQL`);
    
    // Switch to the database
    await connection.execute(`USE ${dbName}`);
    
    // Check if seller_profiles table exists
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'seller_profiles'
    `, [dbName]);
    
    if (tables.length > 0) {
      console.log('✅ Tabel seller_profiles sudah ada');
    } else {
      console.log('📦 Membuat tabel seller_profiles...');
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS seller_profiles (
          id INT PRIMARY KEY AUTO_INCREMENT,
          user_id INT NOT NULL UNIQUE,
          bio TEXT,
          skills TEXT,
          experience_years INT DEFAULT 0,
          portfolio_url VARCHAR(255),
          rating DECIMAL(3,2) DEFAULT 0.00,
          total_reviews INT DEFAULT 0,
          total_orders INT DEFAULT 0,
          completion_rate DECIMAL(5,2) DEFAULT 0.00,
          response_time INT DEFAULT 0,
          is_active BOOLEAN DEFAULT TRUE,
          max_concurrent_orders INT DEFAULT 5,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
          INDEX idx_seller_profiles_user_id (user_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('✅ Tabel seller_profiles berhasil dibuat');
    }
    
    // Check and create categories table
    const [categoriesTables] = await connection.execute(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'categories'
    `, [dbName]);
    
    if (categoriesTables.length > 0) {
      console.log('✅ Tabel categories sudah ada');
    } else {
      console.log('📦 Membuat tabel categories...');
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS categories (
          id INT PRIMARY KEY AUTO_INCREMENT,
          name VARCHAR(100) NOT NULL,
          description TEXT,
          icon VARCHAR(100),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      
      // Insert default categories
      await connection.execute(`
        INSERT IGNORE INTO categories (name, description) VALUES
        ('Design Grafis', 'Jasa desain logo, banner, poster, dan materi visual lainnya'),
        ('Web Development', 'Pengembangan website, aplikasi web, dan sistem online'),
        ('Mobile Development', 'Pengembangan aplikasi mobile untuk Android dan iOS'),
        ('Content Writing', 'Penulisan artikel, blog, copywriting, dan konten kreatif'),
        ('Video Editing', 'Editing video, motion graphics, dan produksi video'),
        ('Photography', 'Fotografi produk, event, dan jasa fotografi profesional'),
        ('Marketing Digital', 'Konsultan marketing, SEO, dan strategi digital'),
        ('Translation', 'Penerjemahan dokumen dan konten dalam berbagai bahasa'),
        ('Data Analysis', 'Analisis data, visualisasi, dan laporan bisnis'),
        ('Other', 'Jasa kreatif lainnya yang tidak terdaftar')
      `);
      console.log('✅ Tabel categories berhasil dibuat dengan data default');
    }
    
    // Check and create services table
    const [servicesTables] = await connection.execute(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'services'
    `, [dbName]);
    
    if (servicesTables.length === 0) {
      console.log('📦 Membuat tabel services...');
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS services (
          id INT PRIMARY KEY AUTO_INCREMENT,
          seller_id INT NOT NULL,
          category_id INT,
          title VARCHAR(255) NOT NULL,
          description TEXT NOT NULL,
          tags TEXT,
          is_featured BOOLEAN DEFAULT FALSE,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (seller_id) REFERENCES seller_profiles(id) ON DELETE CASCADE,
          FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
          INDEX idx_services_seller_id (seller_id),
          INDEX idx_services_category_id (category_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('✅ Tabel services berhasil dibuat');
    } else {
      console.log('✅ Tabel services sudah ada');
    }
    
    // Check and create service_packages table
    const [packagesTables] = await connection.execute(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'service_packages'
    `, [dbName]);
    
    if (packagesTables.length === 0) {
      console.log('📦 Membuat tabel service_packages...');
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS service_packages (
          id INT PRIMARY KEY AUTO_INCREMENT,
          service_id INT NOT NULL,
          package_type ENUM('basic', 'standard', 'premium') NOT NULL,
          name VARCHAR(100) NOT NULL,
          description TEXT,
          price DECIMAL(10,2) NOT NULL,
          delivery_days INT NOT NULL,
          revisions INT DEFAULT 0,
          features TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('✅ Tabel service_packages berhasil dibuat');
    } else {
      console.log('✅ Tabel service_packages sudah ada');
    }
    
    console.log('\n========================================');
    console.log('✅ Setup database selesai!');
    console.log('========================================\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('- Pastikan MySQL/XAMPP sudah running');
    console.log('- Cek file .env untuk konfigurasi database');
    console.log('- Pastikan database "grafenda" sudah ada');
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

createMissingTables();
