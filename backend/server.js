const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// ==================== Configuration ====================
if (!process.env.DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL is not set in .env file');
  console.error('Please create a .env file with DATABASE_URL');
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error('❌ ERROR: JWT_SECRET is not set in .env file');
  console.error('Please create a .env file with JWT_SECRET');
  process.exit(1);
}

// ==================== Database Setup ====================
const isRenderDB = process.env.DATABASE_URL.includes('render.com');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isRenderDB ? { rejectUnauthorized: false } : false,
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 20000
});

pool.on('error', (err) => {
  console.error('Database pool error:', err.message);
});

// ==================== Middleware ====================
app.use(cors({ origin: '*' }));
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// ==================== Helper Functions ====================
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => {
    console.error('Async error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });
};

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// ==================== Routes ====================

// Root route - welcome message
app.get('/', (req, res) => {
  res.json({
    message: 'Warren Library System API',
    version: '1.0.0',
    status: 'running',
    info: 'This is an API server. All endpoints are under /api',
    documentation: 'Visit /api for API information or see README.md for full documentation'
  });
});

// API Info
app.get('/api', (req, res) => {
  res.json({
    message: 'Warren Library System API',
    version: '1.0.0',
    status: 'running'
  });
});

// Register
app.post('/api/register', asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email, and password are required' });
  }

  try {
    // Check if email already exists
    const emailCheck = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Check if username already exists
    const usernameCheck = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
    if (usernameCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4)',
      [username, email, hashedPassword, 'student']
    );
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Registration error:', err);
    if (err.code === '23505') {
      return res.status(400).json({ error: 'User already exists' });
    }
    res.status(500).json({ error: 'Registration failed' });
  }
}));

// Login
app.post('/api/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    // Trim and normalize email (case-insensitive)
    const emailTrimmed = email.trim();
    const emailLower = emailTrimmed.toLowerCase();
    
    console.log(`Login attempt - Email received: "${emailTrimmed}" (normalized: "${emailLower}")`);
    
    // Try exact match first, then case-insensitive
    let result = await pool.query('SELECT * FROM users WHERE email = $1', [emailTrimmed]);
    if (result.rows.length === 0) {
      result = await pool.query('SELECT * FROM users WHERE LOWER(email) = $1', [emailLower]);
    }
    
    const user = result.rows[0];

    if (!user) {
      console.log(`User not found for email: "${emailTrimmed}"`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log(`User found: ${user.email}, Role: ${user.role}`);
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      console.log('Password mismatch');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log(`Login successful for: ${user.email}`);
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, role: user.role });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
}));

// Get Books
app.get('/api/books', authenticateToken, asyncHandler(async (req, res) => {
  try {
    const { title, author, category } = req.query;
    let query = `
      SELECT b.*, 
             CASE 
               WHEN EXISTS (
                 SELECT 1 FROM borrows 
                 WHERE book_id = b.id AND return_date IS NULL
               ) THEN false 
               ELSE true 
             END as available
      FROM books b
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (title) {
      query += ` AND b.title ILIKE $${paramCount}`;
      params.push(`%${title}%`);
      paramCount++;
    }
    if (author) {
      query += ` AND b.author ILIKE $${paramCount}`;
      params.push(`%${author}%`);
      paramCount++;
    }
    if (category) {
      query += ` AND b.category ILIKE $${paramCount}`;
      params.push(`%${category}%`);
      paramCount++;
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Get books error:', err);
    res.status(500).json({ error: 'Failed to fetch books' });
  }
}));

// Add Book (Admin only)
app.post('/api/books', authenticateToken, asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const { title, author, isbn, category } = req.body;

  if (!title || !author || !isbn) {
    return res.status(400).json({ error: 'Title, author, and ISBN are required' });
  }

  try {
    await pool.query(
      'INSERT INTO books (title, author, isbn, category, available) VALUES ($1, $2, $3, $4, $5)',
      [title, author, isbn, category || null, true]
    );
    res.status(201).json({ message: 'Book added successfully' });
  } catch (err) {
    console.error('Add book error:', err);
    if (err.code === '23505') {
      return res.status(400).json({ error: 'ISBN already exists' });
    }
    res.status(500).json({ error: 'Failed to add book' });
  }
}));

// Update Book (Admin only)
app.put('/api/books/:id', authenticateToken, asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const { id } = req.params;
  const { title, author, isbn, category } = req.body;

  // Availability is automatically calculated based on borrows, so we don't update it

  try {
    await pool.query(
      'UPDATE books SET title=$1, author=$2, isbn=$3, category=$4 WHERE id=$5',
      [title, author, isbn, category || null, id]
    );
    res.json({ message: 'Book updated successfully' });
  } catch (err) {
    console.error('Update book error:', err);
    res.status(500).json({ error: 'Failed to update book' });
  }
}));

// Delete Book (Admin only)
app.delete('/api/books/:id', authenticateToken, asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const { id } = req.params;

  try {
    await pool.query('DELETE FROM borrows WHERE book_id=$1', [id]);
    await pool.query('DELETE FROM books WHERE id=$1', [id]);
    res.json({ message: 'Book deleted successfully' });
  } catch (err) {
    console.error('Delete book error:', err);
    res.status(500).json({ error: 'Failed to delete book' });
  }
}));

// Borrow Book (Student only)
app.post('/api/borrow', authenticateToken, asyncHandler(async (req, res) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ error: 'Student access required' });
  }

  const { book_id } = req.body;

  if (!book_id) {
    return res.status(400).json({ error: 'Book ID is required' });
  }

  try {
    // Check if book exists
    const bookResult = await pool.query('SELECT id FROM books WHERE id=$1', [book_id]);
    const book = bookResult.rows[0];

    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    // Check if book is currently borrowed (has active borrow with no return_date)
    const borrowCheck = await pool.query(
      'SELECT id FROM borrows WHERE book_id=$1 AND return_date IS NULL',
      [book_id]
    );

    if (borrowCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Book is not available (currently borrowed)' });
    }

    const borrowDate = new Date().toISOString().split('T')[0];
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 15);
    const dueDateStr = dueDate.toISOString().split('T')[0];

    await pool.query(
      'INSERT INTO borrows (user_id, book_id, borrow_date, due_date) VALUES ($1, $2, $3, $4)',
      [req.user.id, book_id, borrowDate, dueDateStr]
    );

    // Availability is now calculated automatically, so we don't need to update it

    res.json({ message: 'Book borrowed successfully' });
  } catch (err) {
    console.error('Borrow error:', err);
    res.status(500).json({ error: 'Failed to borrow book' });
  }
}));

// Return Book
app.post('/api/return/:borrow_id', authenticateToken, asyncHandler(async (req, res) => {
  const { borrow_id } = req.params;

  try {
    const borrowResult = await pool.query(
      'SELECT * FROM borrows WHERE id=$1 AND return_date IS NULL',
      [borrow_id]
    );
    const borrow = borrowResult.rows[0];

    if (!borrow) {
      return res.status(404).json({ error: 'Borrow record not found or already returned' });
    }

    if (req.user.role !== 'admin' && borrow.user_id !== req.user.id) {
      return res.status(403).json({ error: 'You can only return your own books' });
    }

    const returnDate = new Date().toISOString().split('T')[0];

    await pool.query('UPDATE borrows SET return_date=$1 WHERE id=$2', [returnDate, borrow_id]);
    
    // Availability is now calculated automatically, so we don't need to update it

    res.json({ message: 'Book returned successfully' });
  } catch (err) {
    console.error('Return error:', err);
    res.status(500).json({ error: 'Failed to return book' });
  }
}));

// Get User's Borrows
app.get('/api/borrows', authenticateToken, asyncHandler(async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT b.*, books.title, books.author 
       FROM borrows b 
       JOIN books ON b.book_id = books.id 
       WHERE b.user_id = $1 
       ORDER BY b.borrow_date DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get borrows error:', err);
    res.status(500).json({ error: 'Failed to fetch borrows' });
  }
}));

// ==================== Error Handling ====================
app.use((req, res) => {
  res.status(404).json({ 
    message: 'Route not found',
    info: 'This is an API server. All endpoints are under /api',
    availableEndpoints: '/api',
    documentation: 'Visit /api for API information or see README.md for full documentation'
  });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  if (!res.headersSent) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== Server Startup ====================
app.listen(PORT, async () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api\n`);

  // Test database connection
  try {
    await pool.query('SELECT NOW()');
    console.log('✓ Database connected successfully\n');
  } catch (err) {
    console.error('✗ Database connection failed:', err.message);
    console.error('⚠️  Server will continue but database operations may fail\n');
  }
});
