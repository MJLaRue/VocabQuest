// === AUTH.JS - Login & Registration Logic ===

const API_BASE = '';

// DOM Elements for Login Page
const loginForm = document.getElementById('login-form');
const loginBtn = document.getElementById('login-btn');
const registerForm = document.getElementById('register-form');
const registerBtn = document.getElementById('register-btn');

// === LOGIN HANDLER ===
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('error-message');
    
    // Clear previous errors
    errorDiv.style.display = 'none';
    errorDiv.textContent = '';
    
    // Show loading state
    loginBtn.disabled = true;
    loginBtn.innerHTML = '<span class="spinner"></span> Logging in...';
    
    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Success - redirect to app
        window.location.href = '/app.html';
      } else {
        // Show error
        errorDiv.textContent = data.error || 'Login failed. Please try again.';
        errorDiv.style.display = 'block';
        
        // Reset button
        loginBtn.disabled = false;
        loginBtn.textContent = 'Log In';
      }
    } catch (error) {
      console.error('Login error:', error);
      errorDiv.textContent = 'Network error. Please check your connection.';
      errorDiv.style.display = 'block';
      
      // Reset button
      loginBtn.disabled = false;
      loginBtn.textContent = 'Log In';
    }
  });
}

// === REGISTRATION HANDLER ===
if (registerForm) {
  const passwordInput = document.getElementById('password');
  const confirmPasswordInput = document.getElementById('confirm-password');
  
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    const errorDiv = document.getElementById('error-message');
    const successDiv = document.getElementById('success-message');
    
    // Clear previous messages
    errorDiv.style.display = 'none';
    errorDiv.textContent = '';
    successDiv.style.display = 'none';
    successDiv.textContent = '';
    
    // Client-side validation
    if (!email.endsWith('.edu')) {
      errorDiv.textContent = 'Registration is restricted to .edu email addresses.';
      errorDiv.style.display = 'block';
      return;
    }
    
    if (password.length < 8) {
      errorDiv.textContent = 'Password must be at least 8 characters long.';
      errorDiv.style.display = 'block';
      return;
    }
    
    if (password !== confirmPassword) {
      errorDiv.textContent = 'Passwords do not match.';
      errorDiv.style.display = 'block';
      return;
    }
    
    // Show loading state
    registerBtn.disabled = true;
    registerBtn.innerHTML = '<span class="spinner"></span> Creating account...';
    
    try {
      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Success - show message and redirect
        successDiv.textContent = 'Account created successfully! Redirecting to login...';
        successDiv.style.display = 'block';
        
        // Clear form
        registerForm.reset();
        
        // Redirect after 2 seconds
        setTimeout(() => {
          window.location.href = '/index.html';
        }, 2000);
      } else {
        // Show error
        errorDiv.textContent = data.error || 'Registration failed. Please try again.';
        errorDiv.style.display = 'block';
        
        // Reset button
        registerBtn.disabled = false;
        registerBtn.textContent = 'Create Account';
      }
    } catch (error) {
      console.error('Registration error:', error);
      errorDiv.textContent = 'Network error. Please check your connection.';
      errorDiv.style.display = 'block';
      
      // Reset button
      registerBtn.disabled = false;
      registerBtn.textContent = 'Create Account';
    }
  });
  
  // Real-time password match validation
  confirmPasswordInput.addEventListener('input', () => {
    if (confirmPasswordInput.value && passwordInput.value !== confirmPasswordInput.value) {
      confirmPasswordInput.style.borderColor = 'var(--coral)';
    } else {
      confirmPasswordInput.style.borderColor = '';
    }
  });
}
