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

// Format date in a simple, readable way
function formatDateOnly(dateString) {
  if (!dateString) return 'N/A';
  try {
    // Remove time portion if present
    const dateStr = dateString.split('T')[0];
    const [year, month, day] = dateStr.split('-');
    
    // Convert to readable format: DD/MM/YYYY
    return `${day}/${month}/${year}`;
  } catch (e) {
    // If parsing fails, try to return just the date part
    return dateString.split('T')[0] || dateString;
  }
}

// Store all borrows and filtered borrows
let allBorrows = [];
let showingRecentOnly = false;

// Load borrows
async function loadBorrows() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'index.html';
    return;
  }

  try {
    allBorrows = await apiRequest('/borrows');
    displayBorrows(allBorrows);
  } catch (err) {
    alert('Error loading borrows: ' + err.message);
    console.error('Load borrows error:', err);
  }
}

// Display borrows
function displayBorrows(borrows) {
  const tbody = document.querySelector('#borrowTable tbody');
  
  if (!tbody) {
    console.error('Table body not found');
    return;
  }

  tbody.innerHTML = '';

  // Check if borrows is an array
  if (!borrows || !Array.isArray(borrows)) {
    const row = document.createElement('tr');
    row.innerHTML = '<td colspan="6" style="text-align: center;">Error loading borrows</td>';
    tbody.appendChild(row);
    return;
  }

  if (borrows.length === 0) {
    const row = document.createElement('tr');
    row.innerHTML = '<td colspan="6" style="text-align: center;">No borrowed books found</td>';
    tbody.appendChild(row);
    return;
  }

  borrows.forEach(borrow => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${escapeHtml(borrow.title)}</td>
      <td>${escapeHtml(borrow.author)}</td>
      <td>${formatDateOnly(borrow.borrow_date)}</td>
      <td>${formatDateOnly(borrow.due_date)}</td>
      <td>${borrow.return_date ? formatDateOnly(borrow.return_date) : 'Not Returned'}</td>
      <td>${!borrow.return_date ? `<button onclick="returnBook(${borrow.id})">Return</button>` : 'Returned'}</td>
    `;
    tbody.appendChild(row);
  });
}

// Show only recent/active borrows (not returned)
function showRecentBorrows() {
  showingRecentOnly = true;
  const recentBorrows = allBorrows.filter(borrow => !borrow.return_date);
  displayBorrows(recentBorrows);
  
  // Update button states
  const showAllBtn = document.getElementById('showAllBtn');
  const showRecentBtn = document.getElementById('showRecentBtn');
  if (showAllBtn) showAllBtn.style.opacity = '0.6';
  if (showRecentBtn) showRecentBtn.style.opacity = '1';
}

// Show all borrows
function showAllBorrows() {
  showingRecentOnly = false;
  displayBorrows(allBorrows);
  
  // Update button states
  const showAllBtn = document.getElementById('showAllBtn');
  const showRecentBtn = document.getElementById('showRecentBtn');
  if (showAllBtn) showAllBtn.style.opacity = '1';
  if (showRecentBtn) showRecentBtn.style.opacity = '0.6';
}

// Return book
async function returnBook(borrowId) {
  if (!confirm('Are you sure you want to return this book?')) {
    return;
  }

  try {
    await apiRequest(`/return/${borrowId}`, 'POST');
    await loadBorrows(); // Reload all borrows
    // Reapply filter if showing recent only
    if (showingRecentOnly) {
      showRecentBorrows();
    }
    alert('Book returned successfully');
  } catch (err) {
    alert('Error returning book: ' + err.message);
    console.error('Return error:', err);
  }
}

// Logout
function logout() {
  localStorage.clear();
  window.location.href = 'index.html';
}

// Load borrows on page load
loadBorrows();
