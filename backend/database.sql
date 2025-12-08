-- Digital Library Database Schema
-- Run this SQL script to create all necessary tables

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'student',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Books table
CREATE TABLE IF NOT EXISTS books (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  isbn VARCHAR(50) UNIQUE NOT NULL,
  category VARCHAR(100),
  available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Borrows table
CREATE TABLE IF NOT EXISTS borrows (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
  borrow_date DATE NOT NULL,
  due_date DATE NOT NULL,
  return_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_books_isbn ON books(isbn);
CREATE INDEX IF NOT EXISTS idx_borrows_user_id ON borrows(user_id);
CREATE INDEX IF NOT EXISTS idx_borrows_book_id ON borrows(book_id);

-- Optional: Insert a sample admin user (password: admin123)
-- Password hash for 'admin123' using bcrypt
-- You can generate your own with: bcrypt.hash('admin123', 10)
-- INSERT INTO users (username, email, password, role) 
-- VALUES ('admin', 'admin@library.com', '$2a$10$YourHashedPasswordHere', 'admin');

