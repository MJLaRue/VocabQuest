const express = require('express');
const router = express.Router();
const { UserProgress, UserGamification, StudySession, Vocabulary } = require('../models');
const { requireAuth } = require('../middleware/auth');
const { calculateNextReview, correctnessToQuality } = require('../utils/spacedRepetition');

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
      // Calculate difficulty score (0-100, higher = more difficult)
      const totalAttempts = p.correctCount + p.incorrectCount;
      let difficultyScore = 0;
      
      if (totalAttempts > 0) {
        const errorRate = p.incorrectCount / totalAttempts;
        // Combine error rate and ease factor
        const easePenalty = Math.max(0, (2.5 - (p.easeFactor || 2.5)) * 20);
        difficultyScore = Math.min(100, Math.round((errorRate * 80) + easePenalty));
      }
      
      wordProgress[p.vocabId] = {
        reviewCount: p.reviewCount,
        correctCount: p.correctCount,
        incorrectCount: p.incorrectCount,
        lastReviewed: p.lastReviewed,
        isKnown: p.isKnown,
        difficultyScore,
        easeFactor: p.easeFactor
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
        incorrectCount: correct ? 0 : 1,
        nextReviewDate: new Date(),
        easeFactor: 2.5,
        reviewInterval: 0
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
    }
    
    // Apply spaced repetition algorithm
    const quality = correctnessToQuality(correct);
    const srData = calculateNextReview(
      quality,
      progress.easeFactor || 2.5,
      progress.reviewInterval || 0,
      progress.reviewCount - 1
    );
    
    progress.easeFactor = srData.easeFactor;
    progress.reviewInterval = srData.interval;
    progress.nextReviewDate = srData.nextReviewDate;
    await progress.save();
    
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
    let calculatedXP = 0;
    
    if (correct) {
      // Calculate adaptive XP based on word difficulty and mode
      let baseXP = 10;
      if (mode === 'quiz') baseXP = 15;
      else if (mode === 'typing') baseXP = 20;
      
      // Difficulty bonus: harder words (higher incorrect rate) give more XP
      const totalAttempts = progress.correctCount + progress.incorrectCount;
      if (totalAttempts > 1) {
        const errorRate = progress.incorrectCount / totalAttempts;
        const difficultyMultiplier = 1 + (errorRate * 0.5); // Up to 50% bonus
        baseXP = Math.round(baseXP * difficultyMultiplier);
      }
      
      // Ease factor bonus: lower ease = harder word = more XP
      if (progress.easeFactor < 2.0) {
        baseXP = Math.round(baseXP * 1.2); // 20% bonus for very difficult words
      }
      
      // Long interval bonus: if reviewing after a long time, give bonus
      if (progress.reviewInterval >= 7) {
        baseXP = Math.round(baseXP * 1.15); // 15% bonus for long-term retention
      }
      
      // Use client's XP as base if it's higher (includes streak bonuses)
      calculatedXP = Math.max(baseXP, xpEarned || 0);
      
      const result = gamification.addXP(calculatedXP);
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
      totalXp: gamification.totalXp,
      xpEarned: calculatedXP
    });
    
  } catch (error) {
    console.error('Submit answer error:', error);
    res.status(500).json({ error: 'Failed to submit answer' });
  }
});

// Get most difficult words for user
router.get('/difficult', requireAuth, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const difficultWords = await UserProgress.findAll({
      where: { userId: req.user.id },
      include: [{
        model: Vocabulary,
        as: 'vocabulary'
      }],
      order: [
        [sequelize.literal('(incorrect_count::float / GREATEST(correct_count + incorrect_count, 1))'), 'DESC'],
        ['incorrect_count', 'DESC']
      ],
      limit: parseInt(limit)
    });
    
    const words = difficultWords.map(p => {
      const totalAttempts = p.correctCount + p.incorrectCount;
      const errorRate = totalAttempts > 0 ? p.incorrectCount / totalAttempts : 0;
      const easePenalty = Math.max(0, (2.5 - (p.easeFactor || 2.5)) * 20);
      const difficultyScore = Math.min(100, Math.round((errorRate * 80) + easePenalty));
      
      return {
        ...p.vocabulary.toJSON(),
        difficultyScore,
        correctCount: p.correctCount,
        incorrectCount: p.incorrectCount,
        reviewCount: p.reviewCount
      };
    });
    
    res.json({ difficultWords: words });
  } catch (error) {
    console.error('Get difficult words error:', error);
    res.status(500).json({ error: 'Failed to get difficult words' });
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

// Get comprehensive user statistics
router.get('/stats', requireAuth, async (req, res) => {
  try {
    // Get gamification data
    const gamification = await UserGamification.findOne({
      where: { userId: req.user.id }
    }) || { totalXp: 0, level: 1, dailyStreak: 0, unlockedAchievements: [] };

    // Get all progress
    const allProgress = await UserProgress.findAll({
      where: { userId: req.user.id }
    });

    // Calculate stats
    const totalReviews = allProgress.reduce((sum, p) => sum + p.reviewCount, 0);
    const totalCorrect = allProgress.reduce((sum, p) => sum + p.correctCount, 0);
    const totalIncorrect = allProgress.reduce((sum, p) => sum + p.incorrectCount, 0);
    const wordsLearned = allProgress.filter(p => p.isKnown).length;
    const accuracy = totalReviews > 0 ? Math.round((totalCorrect / (totalCorrect + totalIncorrect)) * 100) : 0;

    // Get study sessions
    const sessions = await StudySession.findAll({
      where: { userId: req.user.id },
      order: [['started_at', 'DESC']]
    });

    const totalSessions = sessions.length;
    const totalStudyTime = sessions.reduce((sum, s) => {
      if (s.endedAt && s.startedAt) {
        return sum + (new Date(s.endedAt) - new Date(s.startedAt));
      }
      return sum;
    }, 0);
    const avgSessionTime = totalSessions > 0 ? totalStudyTime / totalSessions : 0;
    const lastStudy = sessions.length > 0 ? sessions[0].startedAt : null;

    // Recent sessions (last 7)
    const recentSessions = sessions.slice(0, 7).map(s => ({
      date: s.startedAt,
      xpEarned: s.xpEarned,
      mode: s.mode,
      duration: s.endedAt ? (new Date(s.endedAt) - new Date(s.startedAt)) : 0
    }));

    res.json({
      gamification: {
        level: gamification.level,
        totalXp: gamification.totalXp,
        dailyStreak: gamification.dailyStreak,
        achievements: gamification.unlockedAchievements || []
      },
      progress: {
        wordsLearned,
        totalWords: 676,
        totalReviews,
        totalCorrect,
        totalIncorrect,
        accuracy
      },
      activity: {
        totalSessions,
        totalStudyTime: Math.round(totalStudyTime / 60000), // Convert to minutes
        avgSessionTime: Math.round(avgSessionTime / 60000),
        lastStudy,
        recentSessions
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to get statistics' });
  }
});

module.exports = router;
