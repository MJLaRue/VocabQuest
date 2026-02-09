// === ADMIN.JS - Admin Dashboard Logic ===

const API_BASE = '';

let currentUser = null;
let allUsers = [];
let allVocab = [];

// DOM Elements
const loadingOverlay = document.getElementById('loading-overlay');
const logoutBtn = document.getElementById('logout-btn');
const appBtn = document.getElementById('app-btn');
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');

// Overview
const totalUsersEl = document.getElementById('total-users');
const totalVocabEl = document.getElementById('total-vocab');
const avgXpEl = document.getElementById('avg-xp');
const totalSessionsEl = document.getElementById('total-sessions');
const leaderboardList = document.getElementById('leaderboard-list');

// Users
const usersTableBody = document.getElementById('users-table-body');
const userSearch = document.getElementById('user-search');
const addUserBtn = document.getElementById('add-user-btn');

// Vocabulary
const vocabTableBody = document.getElementById('vocab-table-body');
const vocabSearch = document.getElementById('vocab-search');
const vocabFileInput = document.getElementById('vocab-file-input');
const fileNameDisplay = document.getElementById('file-name');
const downloadVocabBtn = document.getElementById('download-vocab-btn');
const addWordBtn = document.getElementById('add-word-btn');

// Analytics
const analyticsAccuracy = document.getElementById('analytics-accuracy');
const analyticsSessions = document.getElementById('analytics-sessions');
const analyticsXp = document.getElementById('analytics-xp');
const analyticsWords = document.getElementById('analytics-words');

// === API FUNCTIONS ===
async function checkAuth() {
  try {
    const response = await fetch(`${API_BASE}/api/auth/me`, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      window.location.href = '/index.html';
      return null;
    }
    
    const data = await response.json();
    
    // Check if admin
    if (data.user.role !== 'admin') {
      window.location.href = '/app.html';
      return null;
    }
    
    return data.user;
  } catch (error) {
    console.error('Auth check failed:', error);
    window.location.href = '/index.html';
    return null;
  }
}

async function loadStats() {
  const response = await fetch(`${API_BASE}/api/admin/stats`, {
    credentials: 'include'
  });
  
  if (!response.ok) throw new Error('Failed to load stats');
  
  return response.json();
}

async function loadUsers(search = '', page = 1, limit = 100) {
  const params = new URLSearchParams({ page, limit });
  if (search) params.append('search', search);
  
  const response = await fetch(`${API_BASE}/api/admin/users?${params}`, {
    credentials: 'include'
  });
  
  if (!response.ok) throw new Error('Failed to load users');
  
  return response.json();
}

async function deleteUser(userId) {
  const response = await fetch(`${API_BASE}/api/admin/users/${userId}`, {
    method: 'DELETE',
    credentials: 'include'
  });
  
  if (!response.ok) throw new Error('Failed to delete user');
  
  return response.json();
}

async function createUser(email, password, role = 'student') {
  const response = await fetch(`${API_BASE}/api/admin/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ email, password, role })
  });
  
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to create user');
  }
  
  return response.json();
}

async function loadVocabulary(search = '', page = 1, limit = 100) {
  const params = new URLSearchParams({ page, limit });
  if (search) params.append('search', search);
  
  const response = await fetch(`${API_BASE}/api/admin/vocab?${params}`, {
    credentials: 'include'
  });
  
  if (!response.ok) throw new Error('Failed to load vocabulary');
  
  return response.json();
}

async function deleteVocab(vocabId) {
  const response = await fetch(`${API_BASE}/api/admin/vocab/${vocabId}`, {
    method: 'DELETE',
    credentials: 'include'
  });
  
  if (!response.ok) throw new Error('Failed to delete word');
  
  return response.json();
}

async function createVocab(word, partOfSpeech, definition) {
  const response = await fetch(`${API_BASE}/api/admin/vocab`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ word, partOfSpeech, definition })
  });
  
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to create word');
  }
  
  return response.json();
}

async function uploadVocabCSV(file) {
  const formData = new FormData();
  formData.append('csv', file);
  
  const response = await fetch(`${API_BASE}/api/admin/vocab/upload`, {
    method: 'POST',
    credentials: 'include',
    body: formData
  });
  
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to upload CSV');
  }
  
  return response.json();
}

async function downloadVocabCSV() {
  const response = await fetch(`${API_BASE}/api/admin/vocab/download`, {
    credentials: 'include'
  });
  
  if (!response.ok) throw new Error('Failed to download CSV');
  
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'vocabulary.csv';
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

async function handleLogout() {
  const response = await fetch(`${API_BASE}/api/auth/logout`, {
    method: 'POST',
    credentials: 'include'
  });
  
  window.location.href = '/index.html';
}

// === UI FUNCTIONS ===
function switchTab(tabName) {
  tabs.forEach(tab => {
    if (tab.dataset.tab === tabName) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });
  
  tabContents.forEach(content => {
    if (content.id === `${tabName}-tab`) {
      content.classList.add('active');
    } else {
      content.classList.remove('active');
    }
  });
}

function renderOverview(stats) {
  totalUsersEl.textContent = stats.totalUsers || 0;
  totalVocabEl.textContent = stats.totalVocabulary || 0;
  avgXpEl.textContent = Math.round(stats.averageXP || 0);
  totalSessionsEl.textContent = stats.totalSessions || 0;
  
  // Render leaderboard
  leaderboardList.innerHTML = '';
  if (stats.topStudents && stats.topStudents.length > 0) {
    stats.topStudents.forEach((student, index) => {
      const item = document.createElement('div');
      item.className = 'leaderboard-item';
      item.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
          <div class="rank">${index + 1}</div>
          <div>
            <div style="font-weight: 700;">${student.email}</div>
            <div style="font-size: 12px; color: var(--text-secondary);">Level ${student.level} • ${student.dailyStreak} day streak</div>
          </div>
        </div>
        <div style="text-align: right;">
          <div style="font-weight: 800; color: var(--purple);">${student.totalXp} XP</div>
        </div>
      `;
      leaderboardList.appendChild(item);
    });
  } else {
    leaderboardList.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 20px;">No students yet</p>';
  }
}

function renderUsersTable(users) {
  usersTableBody.innerHTML = '';
  
  if (!users || users.length === 0) {
    usersTableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 40px; color: var(--text-secondary);">No users found</td></tr>';
    return;
  }
  
  users.forEach(user => {
    const row = document.createElement('tr');
    
    const lastLogin = user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never';
    const gamification = user.UserGamification || {};
    
    row.innerHTML = `
      <td><strong>${user.email}</strong></td>
      <td><span class="pos-pill">${user.role}</span></td>
      <td>${gamification.level || 1}</td>
      <td>${gamification.totalXp || 0}</td>
      <td>${gamification.dailyStreak || 0}🔥</td>
      <td>${lastLogin}</td>
      <td>
        <button class="action-btn danger" data-user-id="${user.id}">Delete</button>
      </td>
    `;
    
    const deleteBtn = row.querySelector('.action-btn.danger');
    deleteBtn.addEventListener('click', async () => {
      if (confirm(`Are you sure you want to delete user ${user.email}?`)) {
        try {
          await deleteUser(user.id);
          await refreshUsers();
        } catch (error) {
          alert('Failed to delete user: ' + error.message);
        }
      }
    });
    
    usersTableBody.appendChild(row);
  });
}

function renderVocabTable(vocab) {
  vocabTableBody.innerHTML = '';
  
  if (!vocab || vocab.length === 0) {
    vocabTableBody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 40px; color: var(--text-secondary);">No vocabulary found</td></tr>';
    return;
  }
  
  vocab.forEach(word => {
    const row = document.createElement('tr');
    
    row.innerHTML = `
      <td><strong>${word.word}</strong></td>
      <td><span class="pos-pill">${word.partOfSpeech}</span></td>
      <td>${word.definition}</td>
      <td>
        <button class="action-btn danger" data-vocab-id="${word.id}">Delete</button>
      </td>
    `;
    
    const deleteBtn = row.querySelector('.action-btn.danger');
    deleteBtn.addEventListener('click', async () => {
      if (confirm(`Are you sure you want to delete "${word.word}"?`)) {
        try {
          await deleteVocab(word.id);
          await refreshVocab();
        } catch (error) {
          alert('Failed to delete word: ' + error.message);
        }
      }
    });
    
    vocabTableBody.appendChild(row);
  });
}

function renderAnalytics(stats) {
  // Calculate analytics from stats
  const totalProgress = stats.totalUserProgress || 0;
  const totalCorrect = stats.totalCorrectAnswers || 0;
  const accuracy = totalProgress > 0 ? Math.round((totalCorrect / totalProgress) * 100) : 0;
  
  analyticsAccuracy.textContent = `${accuracy}%`;
  analyticsSessions.textContent = stats.totalSessions || 0;
  analyticsXp.textContent = stats.totalXPEarned || 0;
  analyticsWords.textContent = stats.totalWordsLearned || 0;
}

async function refreshUsers() {
  const search = userSearch.value;
  const data = await loadUsers(search);
  allUsers = data.users || [];
  renderUsersTable(allUsers);
}

async function refreshVocab() {
  const search = vocabSearch.value;
  const data = await loadVocabulary(search);
  allVocab = data.vocabulary || [];
  renderVocabTable(allVocab);
}

async function refreshOverview() {
  const stats = await loadStats();
  renderOverview(stats);
  renderAnalytics(stats);
}

// === EVENT LISTENERS ===
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    switchTab(tab.dataset.tab);
  });
});

logoutBtn.addEventListener('click', handleLogout);

appBtn.addEventListener('click', () => {
  window.location.href = '/app.html';
});

userSearch.addEventListener('input', async () => {
  await refreshUsers();
});

vocabSearch.addEventListener('input', async () => {
  await refreshVocab();
});

addUserBtn.addEventListener('click', () => {
  const email = prompt('Enter user email:');
  if (!email) return;
  
  const password = prompt('Enter user password:');
  if (!password) return;
  
  const role = confirm('Make this user an admin?') ? 'admin' : 'student';
  
  createUser(email, password, role)
    .then(async () => {
      alert('User created successfully!');
      await refreshUsers();
      await refreshOverview();
    })
    .catch(error => {
      alert('Failed to create user: ' + error.message);
    });
});

addWordBtn.addEventListener('click', () => {
  const word = prompt('Enter word:');
  if (!word) return;
  
  const partOfSpeech = prompt('Enter part of speech (e.g., noun, verb, adj):');
  if (!partOfSpeech) return;
  
  const definition = prompt('Enter definition:');
  if (!definition) return;
  
  createVocab(word, partOfSpeech, definition)
    .then(async () => {
      alert('Word added successfully!');
      await refreshVocab();
      await refreshOverview();
    })
    .catch(error => {
      alert('Failed to add word: ' + error.message);
    });
});

vocabFileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  fileNameDisplay.textContent = `Selected: ${file.name}`;
  
  if (confirm(`Upload ${file.name}? This will replace existing vocabulary.`)) {
    loadingOverlay.style.display = 'flex';
    
    try {
      const result = await uploadVocabCSV(file);
      alert(`Success! Imported ${result.imported} words, skipped ${result.skipped} duplicates.`);
      await refreshVocab();
      await refreshOverview();
    } catch (error) {
      alert('Failed to upload CSV: ' + error.message);
    } finally {
      loadingOverlay.style.display = 'none';
      vocabFileInput.value = '';
      fileNameDisplay.textContent = '';
    }
  } else {
    vocabFileInput.value = '';
    fileNameDisplay.textContent = '';
  }
});

downloadVocabBtn.addEventListener('click', async () => {
  try {
    await downloadVocabCSV();
  } catch (error) {
    alert('Failed to download CSV: ' + error.message);
  }
});

// === BOOTSTRAP ===
(async function bootstrap() {
  loadingOverlay.style.display = 'flex';
  
  try {
    // Check auth
    currentUser = await checkAuth();
    if (!currentUser) return;
    
    // Load all data
    await refreshOverview();
    await refreshUsers();
    await refreshVocab();
    
  } catch (error) {
    console.error('Bootstrap error:', error);
    alert('Failed to load admin dashboard. Please try refreshing the page.');
  } finally {
    loadingOverlay.style.display = 'none';
  }
})();
