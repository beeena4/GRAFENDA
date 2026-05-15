-- Grafenda Database - Setup Missing Tables
-- Run this if setup-tables.js fails or for manual setup

USE grafenda;

-- Create seller_profiles table if it doesn't exist
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create categories table if it doesn't exist
CREATE TABLE IF NOT EXISTS categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default categories
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
('Other', 'Jasa kreatif lainnya yang tidak terdaftar');

-- Create services table if it doesn't exist
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create service_packages table if it doesn't exist
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Verify tables exist
SELECT 'seller_profiles' as table_name, COUNT(*) as record_count FROM seller_profiles
UNION ALL
SELECT 'categories' as table_name, COUNT(*) as record_count FROM categories
UNION ALL
SELECT 'services' as table_name, COUNT(*) as record_count FROM services
UNION ALL
SELECT 'service_packages' as table_name, COUNT(*) as record_count FROM service_packages;
