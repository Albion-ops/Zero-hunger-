-- MySQL schema for Zero Hunger System (Node.js backend)
CREATE DATABASE IF NOT EXISTS zerohunger_db;
USE zerohunger_db;

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  role ENUM('user', 'admin') DEFAULT 'user',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME,
  is_active BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Resources table (existing)
CREATE TABLE IF NOT EXISTS resources (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  phone VARCHAR(50),
  email VARCHAR(255),
  location VARCHAR(255),
  food_type VARCHAR(255),
  quantity VARCHAR(100),
  notes TEXT,
  submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  user_id INT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Sessions table for managing user sessions
CREATE TABLE IF NOT EXISTS sessions (
  id VARCHAR(128) PRIMARY KEY,
  user_id INT NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert default admin user (password: admin123)
INSERT IGNORE INTO users (username, email, password_hash, full_name, role) 
VALUES ('admin', 'admin@zerohunger.org', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'System Administrator', 'admin');
