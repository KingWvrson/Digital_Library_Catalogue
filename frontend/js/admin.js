const LOCAL_API_BASE = 'http://localhost:5000/api';
const REMOTE_API_BASE = 'https://digital-library-catalogue.onrender.com/api';
const useLocalApi =
  window.location.search.includes('useLocalApi=true') ||
  localStorage.getItem('useLocalApi') === 'true';
const API_BASE_URL =
  useLocalApi && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? LOCAL_API_BASE
    : REMOTE_API_BASE;

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

// Load books
async function loadBooks() {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  
  if (!token || role !== 'admin') {
    window.location.href = 'index.html';
    return;
  }

  try {
    const books = await apiRequest('/books');
    const tbody = document.querySelector('#bookTable tbody');
    
    if (!tbody) {
      console.error('Table body not found');
      return;
    }

    tbody.innerHTML = '';

    // Check if books is an array
    if (!books || !Array.isArray(books)) {
      const row = document.createElement('tr');
      row.innerHTML = '<td colspan="6" style="text-align: center;">Error loading books</td>';
      tbody.appendChild(row);
      return;
    }

    if (books.length === 0) {
      const row = document.createElement('tr');
      row.innerHTML = '<td colspan="6" style="text-align: center;">No books found</td>';
      tbody.appendChild(row);
      return;
    }

    books.forEach(book => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td><input type="text" value="${escapeHtml(book.title)}" id="title${book.id}"></td>
        <td><input type="text" value="${escapeHtml(book.author)}" id="author${book.id}"></td>
        <td><input type="text" value="${escapeHtml(book.isbn)}" id="isbn${book.id}"></td>
        <td><input type="text" value="${escapeHtml(book.category || '')}" id="category${book.id}"></td>
        <td>${book.available ? '<span class="status-available">Available</span>' : '<span class="status-unavailable">Unavailable</span>'}</td>
        <td>
          <button onclick="updateBook(${book.id})">Update</button>
          <button onclick="deleteBook(${book.id})">Delete</button>
        </td>
      `;
      tbody.appendChild(row);
    });
  } catch (err) {
    alert('Error loading books: ' + err.message);
    console.error('Load books error:', err);
  }
}

// Add book form handler
const addBookForm = document.getElementById('addBookForm');
if (addBookForm) {
  addBookForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('title').value.trim();
    const author = document.getElementById('author').value.trim();
    const isbn = document.getElementById('isbn').value.trim();
    const category = document.getElementById('category').value.trim();

    if (!title || !author || !isbn) {
      alert('Title, author, and ISBN are required');
      return;
    }

    try {
      await apiRequest('/books', 'POST', { title, author, isbn, category: category || null });
      addBookForm.reset();
      await loadBooks();
      alert('Book added successfully');
    } catch (err) {
      alert('Error adding book: ' + err.message);
      console.error('Add book error:', err);
    }
  });
}

// Update book
async function updateBook(id) {
  const title = document.getElementById(`title${id}`).value.trim();
  const author = document.getElementById(`author${id}`).value.trim();
  const isbn = document.getElementById(`isbn${id}`).value.trim();
  const category = document.getElementById(`category${id}`).value.trim();

  if (!title || !author || !isbn) {
    alert('Title, author, and ISBN are required');
    return;
  }

  try {
    await apiRequest(`/books/${id}`, 'PUT', { title, author, isbn, category: category || null });
    await loadBooks();
    alert('Book updated successfully');
  } catch (err) {
    alert('Error updating book: ' + err.message);
    console.error('Update book error:', err);
  }
}

// Delete book
async function deleteBook(id) {
  if (!confirm('Are you sure you want to delete this book?')) {
    return;
  }

  try {
    await apiRequest(`/books/${id}`, 'DELETE');
    await loadBooks();
    alert('Book deleted successfully');
  } catch (err) {
    alert('Error deleting book: ' + err.message);
    console.error('Delete book error:', err);
  }
}

// Logout
function logout() {
  localStorage.clear();
  window.location.href = 'index.html';
}

// Load books on page load
loadBooks();
