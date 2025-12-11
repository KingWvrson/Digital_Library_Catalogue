const LOCAL_API_BASE = 'http://localhost:5000/api';
const REMOTE_API_BASE = 'https://digital-library-catalogue.onrender.com/api';
const useLocalApi =
  window.location.search.includes('useLocalApi=true') ||
  localStorage.getItem('useLocalApi') === 'true';
const API_BASE_URL =
  useLocalApi && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? LOCAL_API_BASE
    : REMOTE_API_BASE;

// ==================== Utility Functions ====================
function showError(message) {
  alert(message);
  console.error('Error:', message);
}

function showSuccess(message) {
  alert(message);
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function setButtonState(button, loading, originalText) {
  if (button) {
    button.disabled = loading;
    // Preserve icon when showing loading state
    if (loading) {
      button.innerHTML = '⏳ Processing...';
    } else {
      button.innerHTML = originalText;
    }
  }
}

// ==================== API Request Handler ====================
async function apiRequest(endpoint, method = 'GET', body = null) {
  const options = {
    method: method,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    
    // Check content type
    const contentType = response.headers.get('content-type') || '';
    
    // Handle non-JSON responses
    if (!contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Non-JSON response:', text.substring(0, 500));
      
      // Try to extract meaningful error from HTML
      if (text.includes('ECONNREFUSED') || text.includes('ECONNRESET')) {
        throw new Error('Database connection failed. Please check the server.');
      }
      
      throw new Error('Server returned an invalid response. Please try again.');
    }

    // Parse JSON response
    const data = await response.json();

    // Handle error responses
    if (!response.ok) {
      const errorMessage = data.error || data.message || `Request failed with status ${response.status}`;
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    // Handle network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Cannot connect to server. Please make sure the backend is running on port 5000.');
    }
    
    // Re-throw other errors
    throw error;
  }
}

// ==================== Login Handler ====================
document.addEventListener('DOMContentLoaded', () => {
  console.log('Auth.js loaded');
  
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {

  loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
    console.log('Login form submitted');

    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const submitButton = loginForm.querySelector('button[type="submit"]');

    if (!emailInput || !passwordInput) {
      showError('Form elements not found. Please refresh the page.');
      return;
    }

    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const originalButtonText = submitButton ? submitButton.innerHTML : '🔐 Login';

    // Validation
    if (!email || !password) {
      showError('Please fill in both email and password');
      return;
    }

    if (!isValidEmail(email)) {
      showError('Please enter a valid email address');
      emailInput.focus();
      return;
    }

    setButtonState(submitButton, true, originalButtonText);

    try {
      console.log('Sending login request...');
      const data = await apiRequest('/login', 'POST', { email, password });
      console.log('Login response received:', data);

      if (data.token && data.role) {
        // Store authentication data
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);
        console.log('Token stored, redirecting...');

        // Redirect based on role
        const redirectUrl = data.role === 'admin' ? 'admin.html' : 'catalogue.html';
        window.location.href = redirectUrl;
    } else {
        showError('Invalid response from server. Missing token or role.');
    }
    } catch (error) {
      console.error('Login error:', error);
      showError(error.message || 'Login failed. Please check your credentials and try again.');
    } finally {
      setButtonState(submitButton, false, originalButtonText);
  }
  });
  }

  // ==================== Register Handler ====================
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {

  registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
    console.log('Register form submitted');

    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('emailReg');
    const passwordInput = document.getElementById('passwordReg');
    const submitButton = registerForm.querySelector('button[type="submit"]');

    if (!usernameInput || !emailInput || !passwordInput) {
      showError('Form elements not found. Please refresh the page.');
      return;
    }

    const username = usernameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const originalButtonText = submitButton ? submitButton.innerHTML : '✏️ Register';

    // Validation
    if (!username || !email || !password) {
      showError('Please fill in all fields');
      return;
    }

    if (username.length < 3) {
      showError('Username must be at least 3 characters long');
      usernameInput.focus();
      return;
    }

    if (!isValidEmail(email)) {
      showError('Please enter a valid email address');
      emailInput.focus();
      return;
    }

    if (password.length < 6) {
      showError('Password must be at least 6 characters long');
      passwordInput.focus();
      return;
    }

    setButtonState(submitButton, true, originalButtonText);

    try {
      console.log('Sending register request...');
      await apiRequest('/register', 'POST', { username, email, password });
      console.log('Registration successful');

      showSuccess('Registration successful! Redirecting to login page...');
      
      // Clear form and redirect to login page
      registerForm.reset();
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 1500);
    } catch (error) {
      console.error('Register error:', error);
      let errorMessage = error.message || 'Registration failed. Please try again.';

      // Provide helpful messages for common errors
      if (errorMessage.includes('Email already exists') || errorMessage.includes('already exists')) {
        errorMessage = 'This email is already registered. Please try logging in instead.';
        emailInput.value = '';
        emailInput.focus();
      } else if (errorMessage.includes('Username already exists')) {
        errorMessage = 'This username is already taken. Please choose a different username.';
        usernameInput.value = '';
        usernameInput.focus();
      }

      showError(errorMessage);
    } finally {
      setButtonState(submitButton, false, originalButtonText);
  }
  });
  }
});
