const API_BASE_URL = 'http://localhost:5000/api';

// Store all books and filtered books
let allBooks = [];
let displayedBooks = [];

// Helper function for API requests
async function apiRequest(endpoint, method = 'GET', body = null) {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'index.html';
    return;
  }

  const options = {
    method: method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
  
  if (response.status === 401 || response.status === 403) {
    localStorage.clear();
    window.location.href = 'index.html';
    return;
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return await response.json();
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Load all books
async function loadAllBooks() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'index.html';
    return;
  }

  try {
    const books = await apiRequest('/books');
    const booksList = document.getElementById('booksList');
    const bookCount = document.getElementById('bookCount');
    
    if (!booksList) {
      console.error('Books list container not found');
      return;
    }

    // Check if books is an array
    if (!books || !Array.isArray(books)) {
      booksList.innerHTML = '<div class="empty-state">Error loading books</div>';
      if (bookCount) bookCount.textContent = 'Error loading books';
      return;
    }

    allBooks = books;
    displayedBooks = books;
    displayBooks(books);
    
    if (bookCount) {
      bookCount.textContent = `${books.length} book${books.length !== 1 ? 's' : ''} available`;
    }
  } catch (err) {
    const booksList = document.getElementById('booksList');
    if (booksList) {
      booksList.innerHTML = `<div class="empty-state">Error loading books: ${err.message}</div>`;
    }
    console.error('Load books error:', err);
  }
}

// Display books in the list
function displayBooks(books) {
  const booksList = document.getElementById('booksList');
  
  if (!booksList) {
    console.error('Books list container not found');
    return;
  }

  if (books.length === 0) {
    booksList.innerHTML = '<div class="empty-state">No books found</div>';
    return;
  }

  booksList.innerHTML = books.map(book => `
    <div class="book-card ${!book.available ? 'unavailable' : ''}">
      <div class="book-info">
        <h3 class="book-title">${escapeHtml(book.title)}</h3>
        <p class="book-author">by ${escapeHtml(book.author)}</p>
        <div class="book-details">
          <span class="book-isbn">ISBN: ${escapeHtml(book.isbn)}</span>
          ${book.category ? `<span class="book-category">${escapeHtml(book.category)}</span>` : ''}
        </div>
      </div>
      <div class="book-actions">
        ${book.available 
          ? `<button onclick="borrowBook(${book.id})" class="borrow-btn">Borrow</button>`
          : '<span class="status-unavailable">Unavailable</span>'
        }
      </div>
    </div>
  `).join('');
}

// Search handler
function handleSearch() {
  const title = document.getElementById('searchTitle').value.trim().toLowerCase();
  const author = document.getElementById('searchAuthor').value.trim().toLowerCase();
  const category = document.getElementById('searchCategory').value.trim().toLowerCase();
  
  if (!title && !author && !category) {
    // If no search terms, show all books
    displayedBooks = allBooks;
    displayBooks(allBooks);
    const bookCount = document.getElementById('bookCount');
    if (bookCount) {
      bookCount.textContent = `${allBooks.length} book${allBooks.length !== 1 ? 's' : ''} available`;
    }
    return;
  }

  // Filter books based on search criteria
  displayedBooks = allBooks.filter(book => {
    const matchTitle = !title || book.title.toLowerCase().includes(title);
    const matchAuthor = !author || book.author.toLowerCase().includes(author);
    const matchCategory = !category || (book.category && book.category.toLowerCase().includes(category));
    
    return matchTitle && matchAuthor && matchCategory;
  });

  displayBooks(displayedBooks);
  
  const bookCount = document.getElementById('bookCount');
  if (bookCount) {
    bookCount.textContent = `${displayedBooks.length} book${displayedBooks.length !== 1 ? 's' : ''} found`;
  }
}

// Clear search
function clearSearch() {
  document.getElementById('searchTitle').value = '';
  document.getElementById('searchAuthor').value = '';
  document.getElementById('searchCategory').value = '';
  displayedBooks = allBooks;
  displayBooks(allBooks);
  const bookCount = document.getElementById('bookCount');
  if (bookCount) {
    bookCount.textContent = `${allBooks.length} book${allBooks.length !== 1 ? 's' : ''} available`;
  }
}

// Borrow book
async function borrowBook(bookId) {
  if (!confirm('Are you sure you want to borrow this book?')) {
    return;
  }

  try {
    await apiRequest('/borrow', 'POST', { book_id: bookId });
    await loadAllBooks(); // Reload all books to update availability
    alert('Book borrowed successfully');
  } catch (err) {
    alert('Error borrowing book: ' + err.message);
    console.error('Borrow error:', err);
  }
}

// Logout
function logout() {
  localStorage.clear();
  window.location.href = 'index.html';
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  const searchBtn = document.getElementById('searchBtn');
  const clearBtn = document.getElementById('clearBtn');
  const searchInputs = ['searchTitle', 'searchAuthor', 'searchCategory'];
  
  if (searchBtn) {
    searchBtn.addEventListener('click', handleSearch);
  }
  
  if (clearBtn) {
    clearBtn.addEventListener('click', clearSearch);
  }
  
  // Allow Enter key to trigger search
  searchInputs.forEach(inputId => {
    const input = document.getElementById(inputId);
    if (input) {
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          handleSearch();
        }
      });
    }
  });
  
  // Load all books on page load
  loadAllBooks();
});
