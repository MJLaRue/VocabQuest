// === STATS.JS - Student Statistics Dashboard ===

const API_BASE = '';

// DOM Elements
const loadingOverlay = document.getElementById('loading-overlay');
const logoutBtn = document.getElementById('logout-btn');

// Stat displays
const statLevel = document.getElementById('stat-level');
const statXp = document.getElementById('stat-xp');
const statStreak = document.getElementById('stat-streak');
const statAchievements = document.getElementById('stat-achievements');
const statWordsLearned = document.getElementById('stat-words-learned');
const statTotalWords = document.getElementById('stat-total-words');
const statAccuracy = document.getElementById('stat-accuracy');
const statReviews = document.getElementById('stat-reviews');
const statSessions = document.getElementById('stat-sessions');
const statTime = document.getElementById('stat-time');
const statAvgSession = document.getElementById('stat-avg-session');
const statLastStudy = document.getElementById('stat-last-study');
const progressPercent = document.getElementById('progress-percent');
const progressBar = document.getElementById('progress-bar');
const difficultWordsList = document.getElementById('difficult-words-list');
const achievementsList = document.getElementById('achievements-list');
const insightsList = document.getElementById('insights-list');

// Achievement definitions (same as app.js)
const ACHIEVEMENTS = [
  { id: 'first_correct', name: 'First Step', desc: 'Get your first correct answer', icon: '🎯' },
  { id: 'streak_3', name: 'On Fire', desc: '3-day streak', icon: '🔥' },
  { id: 'level_2', name: 'Rising Star', desc: 'Reach level 2', icon: '⭐' },
  { id: 'xp_100', name: 'Century', desc: 'Earn 100 total XP', icon: '💯' },
  { id: 'perfect_10', name: 'Perfect 10', desc: '10 correct in a row', icon: '✨' },
  { id: 'deck_master', name: 'Deck Master', desc: 'Know all cards in deck', icon: '👑' },
  { id: 'quiz_pro', name: 'Quiz Pro', desc: 'Complete 25 quiz questions', icon: '🎓' },
  { id: 'typing_ace', name: 'Typing Ace', desc: 'Complete 25 typing challenges', icon: '⌨️' },
];

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
    return data.user;
  } catch (error) {
    console.error('Auth check failed:', error);
    window.location.href = '/index.html';
    return null;
  }
}

async function loadStats() {
  const response = await fetch(`${API_BASE}/api/progress/stats`, {
    credentials: 'include'
  });
  
  if (!response.ok) throw new Error('Failed to load stats');
  
  const data = await response.json();
  return data;
}

async function loadDifficultWords() {
  const response = await fetch(`${API_BASE}/api/progress/difficult?limit=5`, {
    credentials: 'include'
  });
  
  if (!response.ok) throw new Error('Failed to load difficult words');
  
  const data = await response.json();
  return data.difficultWords || [];
}

async function handleLogout() {
  try {
    await fetch(`${API_BASE}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    });
    window.location.href = '/index.html';
  } catch (error) {
    console.error('Logout failed:', error);
    window.location.href = '/index.html';
  }
}

// === RENDER FUNCTIONS ===
function renderOverview(stats) {
  // Gamification stats
  statLevel.textContent = stats.gamification.level;
  statXp.textContent = stats.gamification.totalXp.toLocaleString();
  statStreak.textContent = stats.gamification.dailyStreak;
  statAchievements.textContent = stats.gamification.achievements.length;

  // Progress stats
  statWordsLearned.textContent = stats.progress.wordsLearned;
  statTotalWords.textContent = stats.progress.totalWords;
  statAccuracy.textContent = `${stats.progress.accuracy}%`;
  statReviews.textContent = stats.progress.totalReviews;

  // Progress bar
  const progressPct = Math.round((stats.progress.wordsLearned / stats.progress.totalWords) * 100);
  progressPercent.textContent = `${progressPct}%`;
  progressBar.style.width = `${progressPct}%`;

  // Activity stats
  statSessions.textContent = stats.activity.totalSessions;
  statTime.textContent = `${stats.activity.totalStudyTime}m`;
  statAvgSession.textContent = `${stats.activity.avgSessionTime}m`;
  
  if (stats.activity.lastStudy) {
    const lastDate = new Date(stats.activity.lastStudy);
    const now = new Date();
    const diffHours = Math.floor((now - lastDate) / (1000 * 60 * 60));
    
    if (diffHours < 1) {
      statLastStudy.textContent = 'Just now';
    } else if (diffHours < 24) {
      statLastStudy.textContent = `${diffHours}h ago`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      statLastStudy.textContent = `${diffDays}d ago`;
    }
  } else {
    statLastStudy.textContent = 'Never';
  }
}

function renderDifficultWords(words) {
  if (words.length === 0) {
    difficultWordsList.innerHTML = '<div style="text-align: center; padding: 20px; color: var(--text-secondary);">No difficult words yet! Keep practicing 😊</div>';
    return;
  }

  difficultWordsList.innerHTML = words.map(word => {
    const totalAttempts = word.correctCount + word.incorrectCount;
    const errorRate = totalAttempts > 0 ? Math.round((word.incorrectCount / totalAttempts) * 100) : 0;
    
    return `
      <div style="padding: 16px; background: var(--bg); border-radius: 12px; border: 2px solid var(--border);">
        <div style="display: flex; justify-content: space-between; align-items: start;">
          <div>
            <div style="font-size: 1.2rem; font-weight: 700; color: var(--text);">${word.word}</div>
            <div style="color: var(--text-secondary); font-size: 0.9rem; margin-top: 4px;">${word.partOfSpeech} • ${word.definition}</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 1.5rem; font-weight: 700; color: var(--gold);">${errorRate}%</div>
            <div style="font-size: 0.8rem; color: var(--text-secondary);">error rate</div>
          </div>
        </div>
        <div style="margin-top: 12px; display: flex; gap: 16px; font-size: 0.85rem; color: var(--text-secondary);">
          <span>✅ ${word.correctCount} correct</span>
          <span>❌ ${word.incorrectCount} incorrect</span>
          <span>🔄 ${word.reviewCount} reviews</span>
        </div>
      </div>
    `;
  }).join('');
}

function renderAchievements(unlockedIds) {
  achievementsList.innerHTML = ACHIEVEMENTS.map(achievement => {
    const unlocked = unlockedIds.includes(achievement.id);
    const opacity = unlocked ? '1' : '0.4';
    const bg = unlocked ? 'var(--bg-light)' : 'var(--bg)';
    
    return `
      <div style="padding: 16px; background: ${bg}; border-radius: 12px; border: 2px solid var(--border); opacity: ${opacity};">
        <div style="display: flex; gap: 16px; align-items: center;">
          <div style="font-size: 3rem;">${achievement.icon}</div>
          <div style="flex: 1;">
            <div style="font-size: 1.1rem; font-weight: 700; color: var(--text);">${achievement.name}</div>
            <div style="color: var(--text-secondary); font-size: 0.9rem; margin-top: 4px;">${achievement.desc}</div>
          </div>
          ${unlocked ? '<div style="font-size: 1.5rem;">✓</div>' : '<div style="font-size: 1.5rem; opacity: 0.3;">🔒</div>'}
        </div>
      </div>
    `;
  }).join('');
}

function renderInsights(stats) {
  const insights = [];

  // Streak insight
  if (stats.gamification.dailyStreak > 0) {
    insights.push({
      icon: '🔥',
      title: 'Consistency Champion',
      text: `You're on a ${stats.gamification.dailyStreak}-day streak! Keep studying daily to maintain it.`
    });
  } else {
    insights.push({
      icon: '📅',
      title: 'Start Your Streak',
      text: 'Study today to start building a daily streak and earn bonus XP!'
    });
  }

  // Progress insight
  const progressPct = Math.round((stats.progress.wordsLearned / stats.progress.totalWords) * 100);
  if (progressPct < 25) {
    insights.push({
      icon: '🌱',
      title: 'Getting Started',
      text: `You've learned ${stats.progress.wordsLearned} words (${progressPct}%). Keep going - you're building a strong foundation!`
    });
  } else if (progressPct < 50) {
    insights.push({
      icon: '📈',
      title: 'Making Progress',
      text: `${progressPct}% complete! You're moving through the vocabulary at a great pace.`
    });
  } else if (progressPct < 75) {
    insights.push({
      icon: '💪',
      title: 'Over Halfway',
      text: `You've mastered ${progressPct}% of the vocabulary. The finish line is in sight!`
    });
  } else {
    insights.push({
      icon: '🎯',
      title: 'Almost There',
      text: `${progressPct}% complete! You're approaching mastery of the entire HSPT vocabulary list.`
    });
  }

  // Accuracy insight
  if (stats.progress.accuracy >= 80) {
    insights.push({
      icon: '🎓',
      title: 'High Accuracy',
      text: `${stats.progress.accuracy}% accuracy shows excellent understanding. You're retaining the material very well!`
    });
  } else if (stats.progress.accuracy >= 60) {
    insights.push({
      icon: '📚',
      title: 'Good Progress',
      text: `${stats.progress.accuracy}% accuracy is solid. Focus on difficult words to improve retention.`
    });
  } else if (stats.progress.totalReviews > 10) {
    insights.push({
      icon: '💡',
      title: 'Review Opportunity',
      text: `Try using hints and Smart Mode to focus on challenging words and improve your ${stats.progress.accuracy}% accuracy.`
    });
  }

  // Study time insight
  if (stats.activity.totalSessions > 0) {
    insights.push({
      icon: '⏱️',
      title: 'Time Invested',
      text: `You've spent ${stats.activity.totalStudyTime} minutes studying across ${stats.activity.totalSessions} sessions. Your dedication is paying off!`
    });
  }

  insightsList.innerHTML = insights.map(insight => `
    <div style="padding: 16px; background: var(--bg-light); border-radius: 12px; border-left: 4px solid var(--purple);">
      <div style="display: flex; gap: 12px; align-items: start;">
        <div style="font-size: 2rem;">${insight.icon}</div>
        <div>
          <div style="font-weight: 700; font-size: 1.1rem; margin-bottom: 4px;">${insight.title}</div>
          <div style="color: var(--text-secondary); font-size: 0.95rem;">${insight.text}</div>
        </div>
      </div>
    </div>
  `).join('');
}

// === EVENT LISTENERS ===
logoutBtn.addEventListener('click', handleLogout);

// === BOOTSTRAP ===
(async function bootstrap() {
  loadingOverlay.style.display = 'flex';
  
  try {
    // Check auth
    const currentUser = await checkAuth();
    if (!currentUser) return;

    // Load stats
    const stats = await loadStats();
    renderOverview(stats);
    renderAchievements(stats.gamification.achievements);
    renderInsights(stats);

    // Load difficult words
    const difficultWords = await loadDifficultWords();
    renderDifficultWords(difficultWords);

    loadingOverlay.style.display = 'none';
  } catch (error) {
    console.error('Failed to load stats:', error);
    loadingOverlay.style.display = 'none';
    alert('Failed to load statistics. Please try again.');
  }
})();
