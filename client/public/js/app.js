// === APP.JS - Flashcards Logic with API Integration ===

const API_BASE = '';

// Global state
let cards = [];
let filteredCards = [];
let currentIndex = 0;
let showDefinition = false;
let searchTerm = "";
let selectedPosFilters = new Set();
let shuffleEnabled = true;
let smartModeEnabled = false;
let mode = "practice"; // practice | quiz | typing
let known = new Set();
let correctCount = 0;
let streak = 0;
let currentUser = null;
let currentSessionId = null;

// Gamification state
let playerXP = 0;
let playerLevel = 1;
let dailyStreak = 0;
let sessionXP = 0;
let sessionCorrect = 0;
let unlockedAchievements = new Set();
let totalQuizzes = 0;
let totalTyping = 0;

const ACHIEVEMENTS = [
  { id: 'first_correct', name: 'First Step', desc: 'Get your first correct answer', icon: '🎯', requirement: () => sessionCorrect >= 1 },
  { id: 'streak_3', name: 'On Fire', desc: '3-day streak', icon: '🔥', requirement: () => dailyStreak >= 3 },
  { id: 'level_2', name: 'Rising Star', desc: 'Reach level 2', icon: '⭐', requirement: () => playerLevel >= 2 },
  { id: 'xp_100', name: 'Century', desc: 'Earn 100 total XP', icon: '💯', requirement: () => playerXP >= 100 },
  { id: 'perfect_10', name: 'Perfect 10', desc: '10 correct in a row', icon: '✨', requirement: () => streak >= 10 },
  { id: 'deck_master', name: 'Deck Master', desc: 'Know all cards in deck', icon: '👑', requirement: () => filteredCards.length > 0 && known.size === filteredCards.length },
  { id: 'quiz_pro', name: 'Quiz Pro', desc: 'Complete 25 quiz questions', icon: '🎓', requirement: () => totalQuizzes >= 25 },
  { id: 'typing_ace', name: 'Typing Ace', desc: 'Complete 25 typing challenges', icon: '⌨️', requirement: () => totalTyping >= 25 },
];

// Hint system state
let currentHintLevel = 0;
const MAX_HINT_LEVELS = 3;

// DOM Elements
const flashcardEl = document.getElementById("flashcard");
const frontEl = document.getElementById("flashcard-front");
const backEl = document.getElementById("flashcard-back");
const counterEl = document.getElementById("counter");
const searchInput = document.getElementById("search-input");
const posFilterContainer = document.getElementById("pos-filters");
const shuffleToggle = document.getElementById("shuffle-toggle");
const smartModeToggle = document.getElementById("smart-mode-toggle");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const knowBtn = document.getElementById("know-btn");
const notYetBtn = document.getElementById("notyet-btn");
const posAllBtn = document.getElementById("pos-all");
const posNoneBtn = document.getElementById("pos-none");
const progressBar = document.getElementById("progress-bar");
const progressPill = document.getElementById("progress-pill");
const streakEl = document.getElementById("streak");
const modeBtns = Array.from(document.querySelectorAll(".mode-btn"));
const quizArea = document.getElementById("quiz-area");
const quizPrompt = document.getElementById("quiz-prompt");
const choiceList = document.getElementById("choice-list");
const typingArea = document.getElementById("typing-area");
const typingPrompt = document.getElementById("typing-prompt");
const typingInput = document.getElementById("typing-input");
const typingSubmit = document.getElementById("typing-submit");
const typingFeedback = document.getElementById("typing-feedback");
const quizHintBtn = document.getElementById("quiz-hint-btn");
const quizHint = document.getElementById("quiz-hint");
const typingHintBtn = document.getElementById("typing-hint-btn");
const typingHint = document.getElementById("typing-hint");
const resetBtn = document.getElementById("reset-btn");
const answerFeedback = document.getElementById("answer-feedback");
const logoutBtn = document.getElementById("logout-btn");

// Gamification elements
const levelNumberEl = document.getElementById("level-number");
const xpCurrentEl = document.getElementById("xp-current");
const xpNextEl = document.getElementById("xp-next");
const xpBarEl = document.getElementById("xp-bar");
const streakNumberEl = document.getElementById("streak-number");
const sessionCorrectEl = document.getElementById("session-correct");
const sessionXpEl = document.getElementById("session-xp");
const achievementsModal = document.getElementById("achievements-modal");
const modalClose = document.getElementById("modal-close");
const continueBtn = document.getElementById("continue-btn");
const achievementsGrid = document.getElementById("achievements-grid");
const loadingOverlay = document.getElementById("loading-overlay");

// === CONFETTI ANIMATIONS ===
function fireConfetti(type = 'default') {
  const confettiSettings = {
    default: {
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    },
    levelUp: {
      particleCount: 150,
      spread: 100,
      startVelocity: 45,
      ticks: 100,
      origin: { y: 0.5 },
      colors: ['#9333ea', '#c026d3', '#ec4899', '#f472b6', '#fbbf24']
    },
    achievement: {
      particleCount: 80,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#fbbf24', '#f59e0b', '#fb923c']
    },
    streak: {
      particleCount: 50,
      angle: 90,
      spread: 45,
      origin: { y: 0.3 },
      colors: ['#ef4444', '#f97316', '#facc15'],
      shapes: ['circle']
    }
  };

  const settings = confettiSettings[type] || confettiSettings.default;
  
  if (window.confetti) {
    window.confetti(settings);
    
    // For special types, add a second burst
    if (type === 'levelUp') {
      setTimeout(() => {
        window.confetti({
          ...settings,
          particleCount: 100,
          angle: 120,
          origin: { x: 1 }
        });
      }, 250);
    } else if (type === 'achievement') {
      setTimeout(() => {
        window.confetti({
          ...settings,
          angle: 120,
          origin: { x: 1 }
        });
      }, 200);
    }
  }
}

// Check if streak reaches milestone and celebrate
function checkStreakMilestone(newStreak) {
  const milestones = [3, 7, 10, 15, 30, 50, 100];
  
  if (milestones.includes(newStreak)) {
    fireConfetti('streak');
    
    const messages = {
      3: "🔥 3-Day Streak! You're on fire!",
      7: "⚡ 7-Day Streak! Outstanding dedication!",
      10: "🌟 10-Day Streak! You're unstoppable!",
      15: "💎 15-Day Streak! Incredible consistency!",
      30: "🏆 30-Day Streak! You're a vocabulary master!",
      50: "👑 50-Day Streak! Legendary commitment!",
      100: "🎖️ 100-Day Streak! You're making history!"
    };
    
    setFeedback(messages[newStreak], "success", `Keep this momentum going!`);
  }
}

// Generate progressive hints for a word
function generateHint(word, hintLevel) {
  const hints = [];
  
  // Level 1: Word length and first letter
  if (hintLevel >= 1) {
    const blanks = '_ '.repeat(word.length - 1);
    hints.push(`First letter: <strong>${word[0].toUpperCase()}</strong>`);
    hints.push(`Word length: ${word.length} letters`);
    hints.push(`<span style="letter-spacing: 4px; font-family: monospace;">${word[0].toUpperCase()} ${blanks}</span>`);
  }
  
  // Level 2: Show more letters (every other letter)
  if (hintLevel >= 2) {
    const revealed = word.split('').map((char, i) => 
      i % 2 === 0 ? char.toUpperCase() : '_'
    ).join(' ');
    hints.push(`More letters: <span style="letter-spacing: 4px; font-family: monospace;">${revealed}</span>`);
  }
  
  // Level 3: Show all but last letter
  if (hintLevel >= 3) {
    const almostThere = word.slice(0, -1).toUpperCase() + ' _';
    hints.push(`Almost there: <span style="letter-spacing: 4px; font-family: monospace;">${almostThere}</span>`);
  }
  
  return hints.join('<br>');
}

// Show hint for current card
function showHint(isTypingMode) {
  if (!filteredCards.length) return;
  
  const card = filteredCards[currentIndex];
  currentHintLevel = Math.min(currentHintLevel + 1, MAX_HINT_LEVELS);
  
  const hintText = generateHint(card.word, currentHintLevel);
  const hintEl = isTypingMode ? typingHint : quizHint;
  const btnEl = isTypingMode ? typingHintBtn : quizHintBtn;
  
  hintEl.innerHTML = hintText;
  hintEl.style.display = 'block';
  
  // Update button text
  if (currentHintLevel >= MAX_HINT_LEVELS) {
    btnEl.textContent = '💡 Max hints reached';
    btnEl.disabled = true;
  } else {
    btnEl.textContent = `💡 Hint ${currentHintLevel}/${MAX_HINT_LEVELS} (Next hint?)`;
  }
}

// Reset hints for new card
function resetHints() {
  currentHintLevel = 0;
  quizHint.style.display = 'none';
  typingHint.style.display = 'none';
  quizHint.innerHTML = '';
  typingHint.innerHTML = '';
  quizHintBtn.textContent = '💡 Need a hint?';
  typingHintBtn.textContent = '💡 Need a hint?';
  quizHintBtn.disabled = false;
  typingHintBtn.disabled = false;
}


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

async function loadVocabulary() {
  const endpoint = smartModeEnabled ? '/api/vocab/smart/prioritized' : '/api/vocab';
  const response = await fetch(`${API_BASE}${endpoint}`, {
    credentials: 'include'
  });
  
  if (!response.ok) throw new Error('Failed to load vocabulary');
  
  const data = await response.json();
  
  if (smartModeEnabled && data.dueCount !== undefined) {
    console.log(`Smart Mode: ${data.dueCount} words due for review`);
  }
  
  return data.vocabulary;
}

async function loadProgress() {
  const response = await fetch(`${API_BASE}/api/progress`, {
    credentials: 'include'
  });
  
  if (!response.ok) throw new Error('Failed to load progress');
  
  const data = await response.json();
  return data;
}

async function loadGamification() {
  const response = await fetch(`${API_BASE}/api/progress/gamification`, {
    credentials: 'include'
  });
  
  if (!response.ok) throw new Error('Failed to load gamification');
  
  const data = await response.json();
  return data;
}

async function submitAnswer(vocabId, isCorrect, xpEarned) {
  const response = await fetch(`${API_BASE}/api/progress/answer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ 
      vocabId, 
      correct: isCorrect, 
      mode, 
      xpEarned 
    })
  });
  
  if (!response.ok) throw new Error('Failed to submit answer');
  
  const data = await response.json();
  return data;
}

async function startSession() {
  const response = await fetch(`${API_BASE}/api/progress/session-start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ mode })
  });
  
  if (!response.ok) throw new Error('Failed to start session');
  
  const data = await response.json();
  currentSessionId = data.sessionId;
  return data;
}

async function endSession() {
  if (!currentSessionId) return;
  
  const response = await fetch(`${API_BASE}/api/progress/session-end`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ sessionId: currentSessionId, xpEarned: sessionXP })
  });
  
  if (!response.ok) throw new Error('Failed to end session');
  
  return response.json();
}

async function handleLogout() {
  await endSession();
  
  const response = await fetch(`${API_BASE}/api/auth/logout`, {
    method: 'POST',
    credentials: 'include'
  });
  
  window.location.href = '/index.html';
}

// --- GAMIFICATION FUNCTIONS ---
function getXPForLevel(level) {
  return Math.floor(100 * Math.pow(1.5, level - 1));
}

function awardXP(amount) {
  playerXP += amount;
  sessionXP += amount;
  
  const xpNeeded = getXPForLevel(playerLevel);
  if (playerXP >= xpNeeded) {
    playerLevel++;
    playerXP -= xpNeeded;
    
    // Level up celebration with confetti
    fireConfetti('levelUp');
    setFeedback(`🎉 Level Up! You're now Level ${playerLevel}!`, 'success', 'Keep up the amazing work!');
  }
  
  updateGamificationUI();
  checkAchievements();
}

function updateGamificationUI() {
  levelNumberEl.textContent = playerLevel;
  xpCurrentEl.textContent = playerXP;
  
  const xpNeeded = getXPForLevel(playerLevel);
  xpNextEl.textContent = xpNeeded;
  
  const xpPercent = (playerXP / xpNeeded) * 100;
  xpBarEl.style.width = `${Math.min(100, xpPercent)}%`;
  
  // Update ARIA attributes for progress bar
  const xpBarContainer = document.querySelector('.xp-bar-container');
  if (xpBarContainer) {
    xpBarContainer.setAttribute('aria-valuenow', Math.round(xpPercent));
    xpBarContainer.setAttribute('aria-valuetext', `${playerXP} out of ${xpNeeded} XP, ${Math.round(xpPercent)}% complete`);
  }
  
  streakNumberEl.textContent = dailyStreak;
  sessionCorrectEl.textContent = sessionCorrect;
  sessionXpEl.textContent = sessionXP;
}

function checkAchievements() {
  let newUnlocks = [];
  
  ACHIEVEMENTS.forEach(achievement => {
    if (!unlockedAchievements.has(achievement.id) && achievement.requirement()) {
      unlockedAchievements.add(achievement.id);
      newUnlocks.push(achievement);
      awardXP(50); // Bonus XP for achievement
    }
  });
  
  if (newUnlocks.length > 0) {
    // Show achievement notification with confetti
    fireConfetti('achievement');
    const names = newUnlocks.map(a => `${a.icon} ${a.name}`).join(', ');
    setFeedback(`🏆 Achievement Unlocked: ${names}`, 'success', 'Check the session summary!');
  }
}

function showAchievementsModal() {
  // Update modal stats
  document.getElementById('modal-xp').textContent = sessionXP;
  document.getElementById('modal-correct').textContent = sessionCorrect;
  document.getElementById('modal-streak').textContent = dailyStreak;
  
  // Render achievements
  achievementsGrid.innerHTML = '';
  ACHIEVEMENTS.forEach(achievement => {
    const isUnlocked = unlockedAchievements.has(achievement.id);
    const card = document.createElement('div');
    card.className = `achievement-card ${isUnlocked ? 'unlocked' : 'locked'}`;
    card.setAttribute('role', 'article');
    card.setAttribute('aria-label', `${achievement.name}: ${achievement.desc} - ${isUnlocked ? 'Unlocked' : 'Locked'}`);
    card.innerHTML = `
      <div class="achievement-icon" aria-hidden="true">${achievement.icon}</div>
      <div class="achievement-name">${achievement.name}</div>
      <div class="achievement-desc">${achievement.desc}</div>
    `;
    achievementsGrid.appendChild(card);
  });
  
  achievementsModal.classList.add('show');
  achievementsModal.setAttribute('aria-hidden', 'false');
  
  // Focus trap: focus the close button
  modalClose.focus();
}

function hideAchievementsModal() {
  achievementsModal.classList.remove('show');
  achievementsModal.setAttribute('aria-hidden', 'true');
  
  // Return focus to achievements button
  document.getElementById('achievements-btn').focus();
}

function cardKey(c) { return c.id; }

// --- INITIALIZATION ---
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function initPosFilters() {
  const posSet = new Set(cards.map(c => c.partOfSpeech));
  posFilterContainer.innerHTML = "";
  selectedPosFilters = new Set();

  posSet.forEach(pos => {
    if (!pos) return;
    const chip = document.createElement("div");
    chip.className = "pos-chip active";
    chip.textContent = pos;
    selectedPosFilters.add(pos);
    chip.addEventListener("click", () => {
      if (chip.classList.contains("active")) {
        chip.classList.remove("active");
        selectedPosFilters.delete(pos);
      } else {
        chip.classList.add("active");
        selectedPosFilters.add(pos);
      }
      applyFilters();
    });
    posFilterContainer.appendChild(chip);
  });
}

function applyFilters() {
  const term = searchTerm.toLowerCase();
  filteredCards = cards.filter(card => {
    if (selectedPosFilters.size && !selectedPosFilters.has(card.partOfSpeech)) return false;
    if (!term) return true;
    return card.word.toLowerCase().includes(term) || card.definition.toLowerCase().includes(term);
  });
  if (shuffleEnabled) shuffleArray(filteredCards);
  currentIndex = 0;
  showDefinition = false;
  renderCard();
  updateProgress();
  resetQuizTypingState();
  setFeedback("");
}

// --- RENDERING ---
function renderCard() {
  flashcardEl.dataset.mode = mode;
  if (!filteredCards.length) {
    frontEl.textContent = "No cards match your filters.";
    backEl.textContent = "";
    flashcardEl.classList.remove("show-back");
    quizArea.style.display = mode === "quiz" ? "block" : "none";
    typingArea.style.display = mode === "typing" ? "block" : "none";
    choiceList.innerHTML = "";
    typingPrompt.textContent = "";
    typingFeedback.textContent = "";
    counterEl.textContent = "0 / 0";
    setFeedback("");
    return;
  }

  const card = filteredCards[currentIndex];
  frontEl.innerHTML = `<div class="term-row"><span class="term">${card.word}</span><span class="pos-pill">${card.partOfSpeech}</span></div>`;
  backEl.innerHTML = `<div class="definition">${card.definition}</div>`;
  counterEl.textContent = `${currentIndex + 1} / ${filteredCards.length}`;

  if (mode === "practice") {
    quizArea.style.display = "none";
    typingArea.style.display = "none";
    choiceList.innerHTML = "";
    typingFeedback.textContent = "";
    flashcardEl.classList.toggle("show-back", showDefinition);
  } else if (mode === "quiz") {
    flashcardEl.classList.remove("show-back");
    quizArea.style.display = "block";
    typingArea.style.display = "none";
    buildQuiz(card);
  } else if (mode === "typing") {
    flashcardEl.classList.remove("show-back");
    quizArea.style.display = "none";
    typingArea.style.display = "block";
    buildTyping(card);
  }
}

function updateProgress() {
  const total = filteredCards.length;
  const knownCount = filteredCards.filter(c => known.has(cardKey(c))).length;
  const pct = total ? Math.round((knownCount / total) * 100) : 0;
  progressBar.style.width = `${pct}%`;
  progressPill.textContent = `Deck: ${knownCount} / ${total} known`;
  updateGamificationUI();
}

// --- QUIZ MODE ---
function buildQuiz(card) {
  quizPrompt.innerHTML = `<div class="term-row"><span class="term">${card.word}</span><span class="pos-pill">${card.partOfSpeech}</span></div><div class="hint">Pick the matching definition.</div>`;
  const options = new Set([card]);
  while (options.size < Math.min(4, filteredCards.length)) {
    const rand = filteredCards[Math.floor(Math.random() * filteredCards.length)];
    options.add(rand);
  }
  const shuffled = Array.from(options);
  shuffleArray(shuffled);
  choiceList.innerHTML = "";
  shuffled.forEach(opt => {
    const btn = document.createElement("button");
    btn.className = "choice";
    btn.textContent = opt.definition;
    btn.addEventListener("click", () => {
      const correct = opt.id === card.id;
      handleAnswer(correct, card);
    });
    choiceList.appendChild(btn);
  });
}

// --- TYPING MODE ---
function buildTyping(card) {
  typingPrompt.textContent = card.definition;
  typingInput.value = "";
  typingFeedback.textContent = "";
  typingInput.focus();
}

function handleTypingSubmit() {
  if (!filteredCards.length) return;
  const card = filteredCards[currentIndex];
  const guess = typingInput.value.trim().toLowerCase();
  const correct = guess === card.word.toLowerCase();
  handleAnswer(correct, card, true);
  typingFeedback.textContent = "";
  if (correct) typingInput.value = "";
}

// --- ANSWERS / PROGRESS ---
async function handleAnswer(correct, card, autoAdvance = false) {
  if (correct) {
    known.add(cardKey(card));
    correctCount += 1;
    streak += 1;
    sessionCorrect += 1;
    
    // Award XP based on mode and streak
    let xpEarned = 10; // Base XP
    if (mode === 'quiz') {
      xpEarned = 15;
      totalQuizzes++;
    } else if (mode === 'typing') {
      xpEarned = 20;
      totalTyping++;
    }
    
    // Streak bonus
    if (streak >= 10) xpEarned += 10;
    else if (streak >= 5) xpEarned += 5;
    
    // Apply hint penalty (reduce XP by 3 per hint used)
    const hintPenalty = currentHintLevel * 3;
    xpEarned = Math.max(1, xpEarned - hintPenalty); // Minimum 1 XP
    
    // Submit to backend first to get server-calculated XP
    try {
      const result = await submitAnswer(card.id, true, xpEarned);
      
      // Use server-calculated XP (which includes difficulty bonuses)
      const actualXP = result.xpEarned || xpEarned;
      awardXP(actualXP);
      
      // Check if daily streak was updated
      if (result.streak !== undefined && result.streak !== dailyStreak) {
        const oldStreak = dailyStreak;
        dailyStreak = result.streak;
        updateGamificationUI();
        
        // Check for streak milestones (only when streak increases)
        if (dailyStreak > oldStreak) {
          checkStreakMilestone(dailyStreak);
        }
      }
    } catch (error) {
      console.error('Failed to submit answer:', error);
    }
  } else {
    streak = 0;
    
    // Submit to backend
    try {
      const result = await submitAnswer(card.id, false, 0);
      
      // Update daily streak if changed
      if (result.streak !== undefined && result.streak !== dailyStreak) {
        dailyStreak = result.streak;
        updateGamificationUI();
      }
    } catch (error) {
      console.error('Failed to submit answer:', error);
    }
  }
  
  if (mode === "quiz" || mode === "typing") {
    const main = correct ? "Nice!" : "Try again";
    const sub = `${card.word} (${card.partOfSpeech}) — ${card.definition}`;
    setFeedback(main, correct ? "success" : "error", sub);
  } else {
    setFeedback("");
  }
  updateProgress();
  if (autoAdvance || mode !== "practice") nextCard();
}

// --- NAVIGATION ---
function nextCard() {
  if (!filteredCards.length) return;
  currentIndex = (currentIndex + 1) % filteredCards.length;
  showDefinition = false;
  resetHints();
  renderCard();
  
  // Check if deck is complete (all cards known)
  if (filteredCards.length > 0 && known.size === filteredCards.length && sessionXP > 0) {
    // Show congratulations modal
    setTimeout(() => showAchievementsModal(), 800);
  }
}

function prevCard() {
  if (!filteredCards.length) return;
  currentIndex = (currentIndex - 1 + filteredCards.length) % filteredCards.length;
  showDefinition = false;
  resetHints();
  renderCard();
}

function flipCard() {
  if (mode !== "practice") return;
  if (!filteredCards.length) return;
  showDefinition = !showDefinition;
  renderCard();
  
  // Subtle confetti burst on flip
  if (showDefinition && window.confetti) {
    window.confetti({
      particleCount: 25,
      spread: 40,
      startVelocity: 20,
      ticks: 40,
      gravity: 1.2,
      origin: { y: 0.5 },
      colors: ['#7c3aed', '#10d9b8', '#ffb703'],
      scalar: 0.7
    });
  }
}

function resetDeck() {
  known.clear();
  streak = 0;
  correctCount = 0;
  resetHints();
  applyFilters();
}

// --- MODE SWITCHING ---
function setMode(newMode) {
  mode = newMode;
  showDefinition = false;
  modeBtns.forEach(btn => {
    const isActive = btn.dataset.mode === newMode;
    btn.classList.toggle("active", isActive);
    btn.setAttribute('aria-pressed', isActive.toString());
  });
  resetQuizTypingState();
  resetHints();
  renderCard();
}

function resetQuizTypingState() {
  typingFeedback.textContent = "";
  typingInput.value = "";
  if (mode === "quiz") choiceList.innerHTML = "";
  resetHints();
}

function setFeedback(message, tone = "", sub = "") {
  if (!message) {
    answerFeedback.innerHTML = "";
    answerFeedback.className = "answer-feedback";
    answerFeedback.classList.remove("show");
    return;
  }
  const main = `<span class="feedback-text">${message}</span>`;
  const subline = sub ? `<span class="feedback-sub">${sub}</span>` : "";
  answerFeedback.innerHTML = `${main}${subline}`;
  answerFeedback.className = `answer-feedback ${tone === "success" ? "feedback-success" : "feedback-error"} show`;
  answerFeedback.style.animation = "popIn 0.22s ease";
}

// --- EVENT LISTENERS ---
const achievementsBtn = document.getElementById("achievements-btn");
achievementsBtn.addEventListener("click", showAchievementsModal);

modalClose.addEventListener('click', hideAchievementsModal);
continueBtn.addEventListener('click', hideAchievementsModal);
achievementsModal.addEventListener('click', (e) => {
  if (e.target === achievementsModal) hideAchievementsModal();
});

flashcardEl.addEventListener("click", flipCard);
nextBtn.addEventListener("click", nextCard);
prevBtn.addEventListener("click", prevCard);
knowBtn.addEventListener("click", () => { if (filteredCards.length) handleAnswer(true, filteredCards[currentIndex], true); });
notYetBtn.addEventListener("click", () => { if (filteredCards.length) handleAnswer(false, filteredCards[currentIndex], true); });
shuffleToggle.addEventListener("change", () => { shuffleEnabled = shuffleToggle.checked; applyFilters(); });
smartModeToggle.addEventListener("change", async () => { 
  smartModeEnabled = smartModeToggle.checked; 
  
  // Disable shuffle when smart mode is on
  if (smartModeEnabled) {
    shuffleToggle.checked = false;
    shuffleToggle.disabled = true;
    shuffleEnabled = false;
  } else {
    shuffleToggle.disabled = false;
    shuffleToggle.checked = true;
    shuffleEnabled = true;
  }
  
  // Reload vocabulary with smart sorting
  try {
    loadingOverlay.style.display = 'flex';
    cards = await loadVocabulary();
    applyFilters();
    setFeedback(smartModeEnabled ? "🧠 Smart Mode: Words prioritized by review schedule" : "Shuffled mode enabled", "success");
  } catch (error) {
    console.error('Failed to reload vocabulary:', error);
    setFeedback("Failed to switch modes", "error");
  } finally {
    loadingOverlay.style.display = 'none';
  }
});
searchInput.addEventListener("input", e => { searchTerm = e.target.value; applyFilters(); });
typingSubmit.addEventListener("click", handleTypingSubmit);
typingInput.addEventListener("keydown", e => { if (e.key === "Enter") handleTypingSubmit(); });
posAllBtn.addEventListener("click", () => { posFilterContainer.querySelectorAll(".pos-chip").forEach(c => c.classList.add("active")); selectedPosFilters = new Set(cards.map(c => c.partOfSpeech)); applyFilters(); });
posNoneBtn.addEventListener("click", () => { posFilterContainer.querySelectorAll(".pos-chip").forEach(c => c.classList.remove("active")); selectedPosFilters.clear(); applyFilters(); });
resetBtn.addEventListener("click", resetDeck);
quizHintBtn.addEventListener("click", () => showHint(false));
typingHintBtn.addEventListener("click", () => showHint(true));
logoutBtn.addEventListener("click", handleLogout);

modeBtns.forEach(btn => btn.addEventListener("click", () => setMode(btn.dataset.mode)));

document.addEventListener("keydown", e => {
  // Close modal with Escape key
  if (e.key === "Escape") {
    const modal = document.getElementById("achievements-modal");
    if (modal && modal.getAttribute("aria-hidden") === "false") {
      hideAchievementsModal();
    }
    return;
  }
  
  // Navigation shortcuts (only when modal is closed)
  const modal = document.getElementById("achievements-modal");
  if (modal && modal.getAttribute("aria-hidden") === "false") return;
  
  if (e.key === "ArrowRight") nextCard();
  else if (e.key === "ArrowLeft") prevCard();
  else if (e.key === " " || e.key === "Enter") {
    e.preventDefault();
    if (mode === "practice") flipCard();
  }
});

// Handle page unload - end session
window.addEventListener('beforeunload', () => {
  endSession();
});

// --- BOOTSTRAP ---
(async function bootstrap() {
  loadingOverlay.style.display = 'flex';
  
  try {
    // Check auth
    currentUser = await checkAuth();
    if (!currentUser) return;
    
    // Show admin link if user is admin
    if (currentUser.role === 'admin') {
      const adminLink = document.getElementById('admin-link');
      if (adminLink) adminLink.style.display = 'block';
    }
    
    // Load vocabulary
    cards = await loadVocabulary();
    filteredCards = [...cards];
    
    // Load progress
    const progressData = await loadProgress();
    if (progressData.knownWords) {
      progressData.knownWords.forEach(id => known.add(id));
    }
    
    // Load gamification
    const gamData = await loadGamification();
    playerXP = gamData.xp || 0;
    playerLevel = gamData.level || 1;
    dailyStreak = gamData.streak || 0;
    if (gamData.unlockedAchievements) {
      unlockedAchievements = new Set(gamData.unlockedAchievements);
    }
    
    // Start session
    await startSession();
    
    // Initialize UI
    initPosFilters();
    applyFilters();
    renderCard();
    updateGamificationUI();
    
  } catch (error) {
    console.error('Bootstrap error:', error);
    alert('Failed to load app. Please try refreshing the page.');
  } finally {
    loadingOverlay.style.display = 'none';
  }
})();
