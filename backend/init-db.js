const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  port: parseInt(process.env.DB_PORT) || 3306,
};

const initDatabase = async () => {
  let connection;
  try {
    console.log('🔄 Menghubungkan ke MySQL...');
    connection = await mysql.createConnection(dbConfig);
    
    const dbName = process.env.DB_NAME || 'grafenda';
    
    console.log(`📋 Membuat database ${dbName}...`);
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    
    console.log(`✅ Database ${dbName} siap!`);
    
    // Switch to the database
    await connection.execute(`USE ${dbName}`);
    
    console.log('📦 Membuat tabel users...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        avatar VARCHAR(255),
        role ENUM('user', 'seller', 'admin') DEFAULT 'user',
        is_verified BOOLEAN DEFAULT FALSE,
        balance DECIMAL(15,2) DEFAULT 0.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_users_email (email),
        INDEX idx_users_role (role)
      )
    `);
    
    console.log('📦 Membuat tabel seller_profiles...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS seller_profiles (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
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
        UNIQUE KEY unique_user_id (user_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_seller_profiles_user_id (user_id)
      )
    `);
    
    console.log('📦 Membuat tabel categories...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        icon VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('📦 Membuat tabel services...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS services (
        id INT PRIMARY KEY AUTO_INCREMENT,
        seller_id INT NOT NULL,
        category_id INT,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        tags TEXT,
        image_url VARCHAR(255),
        is_featured BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (seller_id) REFERENCES seller_profiles(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
        INDEX idx_services_seller_id (seller_id),
        INDEX idx_services_category_id (category_id)
      )
    `);
    
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
      )
    `);
    
    console.log('📦 Membuat tabel portfolios...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS portfolios (
        id INT PRIMARY KEY AUTO_INCREMENT,
        seller_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        image_url VARCHAR(255),
        project_url VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (seller_id) REFERENCES seller_profiles(id) ON DELETE CASCADE
      )
    `);
    
    console.log('📦 Membuat tabel orders...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT PRIMARY KEY AUTO_INCREMENT,
        buyer_id INT NOT NULL,
        seller_id INT NOT NULL,
        service_id INT NOT NULL,
        package_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        status ENUM('pending', 'paid', 'process', 'revision', 'completed', 'cancelled') DEFAULT 'pending',
        delivery_days INT NOT NULL,
        revisions_used INT DEFAULT 0,
        max_revisions INT DEFAULT 0,
        result_image VARCHAR(255),
        started_at TIMESTAMP NULL,
        completed_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (seller_id) REFERENCES seller_profiles(id) ON DELETE CASCADE,
        FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
        FOREIGN KEY (package_id) REFERENCES service_packages(id) ON DELETE CASCADE,
        INDEX idx_orders_buyer_id (buyer_id),
        INDEX idx_orders_seller_id (seller_id),
        INDEX idx_orders_status (status)
      )
    `);
    
    console.log('📦 Membuat tabel payments...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS payments (
        id INT PRIMARY KEY AUTO_INCREMENT,
        order_id INT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        payment_method ENUM('bank_transfer', 'virtual_account', 'e_wallet') NOT NULL,
        payment_proof VARCHAR(255),
        status ENUM('pending', 'verified', 'rejected', 'released') DEFAULT 'pending',
        verified_by INT,
        verified_at TIMESTAMP NULL,
        released_by INT,
        released_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (released_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_payments_order_id (order_id)
      )
    `);
    
    console.log('📦 Membuat tabel chats...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS chats (
        id INT PRIMARY KEY AUTO_INCREMENT,
        order_id INT,
        sender_id INT NOT NULL,
        receiver_id INT NOT NULL,
        message TEXT NOT NULL,
        message_type ENUM('text', 'image', 'file') DEFAULT 'text',
        file_url VARCHAR(255),
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_chats_order_id (order_id)
      )
    `);
    
    console.log('📦 Membuat tabel notifications...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type ENUM('order', 'payment', 'chat', 'review', 'system') DEFAULT 'system',
        is_read BOOLEAN DEFAULT FALSE,
        related_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_notifications_user_id (user_id)
      )
    `);
    
    console.log('📦 Membuat tabel reviews...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS reviews (
        id INT PRIMARY KEY AUTO_INCREMENT,
        order_id INT NOT NULL,
        reviewer_id INT NOT NULL,
        seller_id INT NOT NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (seller_id) REFERENCES seller_profiles(id) ON DELETE CASCADE,
        INDEX idx_reviews_seller_id (seller_id)
      )
    `);
    
    console.log('📦 Membuat tabel withdraws...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS withdraws (
        id INT PRIMARY KEY AUTO_INCREMENT,
        seller_id INT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        bank_name VARCHAR(100),
        account_number VARCHAR(50),
        account_holder VARCHAR(255),
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        approved_by INT,
        approved_at TIMESTAMP NULL,
        processed_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (seller_id) REFERENCES seller_profiles(id) ON DELETE CASCADE,
        FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_withdraws_seller_id (seller_id)
      )
    `);
    
    console.log('📦 Membuat tabel reports...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS reports (
        id INT PRIMARY KEY AUTO_INCREMENT,
        reporter_id INT NOT NULL,
        reported_user_id INT,
        reported_order_id INT,
        reported_service_id INT,
        reason VARCHAR(255) NOT NULL,
        description TEXT,
        status ENUM('pending', 'investigating', 'resolved', 'dismissed') DEFAULT 'pending',
        handled_by INT,
        handled_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (reported_user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (reported_order_id) REFERENCES orders(id) ON DELETE SET NULL,
        FOREIGN KEY (reported_service_id) REFERENCES services(id) ON DELETE SET NULL,
        FOREIGN KEY (handled_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_reports_reporter_id (reporter_id)
      )
    `);
    
    console.log('📦 Menyisipkan kategori default...');
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
    
    console.log('✅ Database setup selesai!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during database setup:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

initDatabase();
