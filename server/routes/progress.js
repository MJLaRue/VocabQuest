const express = require('express');
const router = express.Router();
const { UserProgress, UserGamification, StudySession, Vocabulary } = require('../models');
const { requireAuth } = require('../middleware/auth');

// Get user progress
router.get('/', requireAuth, async (req, res) => {
  try {
    const progress = await UserProgress.findAll({
      where: { userId: req.user.id },
      include: [{
        model: Vocabulary,
        as: 'vocabulary'
      }]
    });
    
    const knownWords = progress.filter(p => p.isKnown).map(p => p.vocabId);
    const wordProgress = {};
    
    progress.forEach(p => {
      wordProgress[p.vocabId] = {
        reviewCount: p.reviewCount,
        correctCount: p.correctCount,
        incorrectCount: p.incorrectCount,
        lastReviewed: p.lastReviewed,
        isKnown: p.isKnown
      };
    });
    
    res.json({ knownWords, wordProgress });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ error: 'Failed to get progress' });
  }
});

// Submit answer
router.post('/answer', requireAuth, async (req, res) => {
  try {
    const { vocabId, correct, mode, xpEarned } = req.body;
    
    if (!vocabId || typeof correct !== 'boolean' || !mode) {
      return res.status(400).json({ error: 'Invalid request data' });
    }
    
    // Update or create progress
    const [progress, created] = await UserProgress.findOrCreate({
      where: { userId: req.user.id, vocabId },
      defaults: {
        isKnown: correct,
        lastReviewed: new Date(),
        reviewCount: 1,
        correctCount: correct ? 1 : 0,
        incorrectCount: correct ? 0 : 1
      }
    });
    
    if (!created) {
      progress.lastReviewed = new Date();
      progress.reviewCount += 1;
      if (correct) {
        progress.correctCount += 1;
        progress.isKnown = true;
      } else {
        progress.incorrectCount += 1;
      }
      await progress.save();
    }
    
    // Update gamification
    let gamification = await UserGamification.findOne({ 
      where: { userId: req.user.id } 
    });
    
    if (!gamification) {
      gamification = await UserGamification.create({ userId: req.user.id });
    }
    
    let leveledUp = false;
    let newLevel = gamification.level;
    let newAchievements = [];
    
    if (xpEarned && correct) {
      const result = gamification.addXP(xpEarned);
      leveledUp = result.leveledUp;
      newLevel = result.newLevel;
      await gamification.save();
    }
    
    // Update streak
    const streak = gamification.updateStreak();
    await gamification.save();
    
    // Check for achievements (simplified - full implementation would check all achievements)
    const achievements = gamification.unlockedAchievements || [];
    
    if (correct && !achievements.includes('first_correct')) {
      achievements.push('first_correct');
      newAchievements.push('first_correct');
      gamification.unlockedAchievements = achievements;
      gamification.addXP(50); // Achievement bonus
      await gamification.save();
    }
    
    res.json({ 
      success: true,
      leveledUp,
      newLevel,
      newAchievements,
      streak,
      totalXp: gamification.totalXp
    });
    
  } catch (error) {
    console.error('Submit answer error:', error);
    res.status(500).json({ error: 'Failed to submit answer' });
  }
});

// Get gamification data
router.get('/gamification', requireAuth, async (req, res) => {
  try {
    let gamification = await UserGamification.findOne({ 
      where: { userId: req.user.id } 
    });
    
    if (!gamification) {
      gamification = await UserGamification.create({ userId: req.user.id });
    }
    
    // Update streak
    const streak = gamification.updateStreak();
    await gamification.save();
    
    const xpToNext = UserGamification.getXPForLevel(gamification.level);
    
    res.json({
      totalXp: gamification.totalXp,
      level: gamification.level,
      xpToNext,
      dailyStreak: streak,
      unlockedAchievements: gamification.unlockedAchievements || []
    });
  } catch (error) {
    console.error('Get gamification error:', error);
    res.status(500).json({ error: 'Failed to get gamification data' });
  }
});

// Start study session
router.post('/session-start', requireAuth, async (req, res) => {
  try {
    const { mode } = req.body;
    
    const session = await StudySession.create({
      userId: req.user.id,
      mode: mode || 'practice',
      startedAt: new Date()
    });
    
    res.json({ sessionId: session.id });
  } catch (error) {
    console.error('Start session error:', error);
    res.status(500).json({ error: 'Failed to start session' });
  }
});

// End study session
router.post('/session-end', requireAuth, async (req, res) => {
  try {
    const { sessionId, xpEarned, cardsReviewed, correctAnswers } = req.body;
    
    const session = await StudySession.findOne({
      where: { id: sessionId, userId: req.user.id }
    });
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    session.endedAt = new Date();
    session.xpEarned = xpEarned || 0;
    session.cardsReviewed = cardsReviewed || 0;
    session.correctAnswers = correctAnswers || 0;
    await session.save();
    
    res.json({ success: true });
  } catch (error) {
    console.error('End session error:', error);
    res.status(500).json({ error: 'Failed to end session' });
  }
});

module.exports = router;
