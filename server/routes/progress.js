const express = require('express');
const router = express.Router();
const { sequelize } = require('../config/db');
const { UserProgress, UserGamification, StudySession, Vocabulary } = require('../models');
const { requireAuth } = require('../middleware/auth');
const { calculateNextReview, correctnessToQuality } = require('../utils/spacedRepetition');
const { checkAchievements, getAllAchievementsStatus } = require('../utils/achievements');

/**
 * Helper to clean up stale sessions for a user.
 * A session is stale if it's been idle for more than 30 minutes.
 * If idle for more than 60 minutes, returns a timedOut flag.
 */
async function cleanupStaleSession(userId) {
  const activeSession = await StudySession.findOne({
    where: {
      userId,
      endedAt: null
    },
    order: [['startedAt', 'DESC']]
  });

  if (!activeSession) return { session: null, timedOut: false };

  const now = new Date();
  const lastInteraction = activeSession.updatedAt || activeSession.updated_at || activeSession.getDataValue('updatedAt');

  if (!lastInteraction) {
    console.warn('Could not find updatedAt for session:', activeSession.id);
    return { session: activeSession, timedOut: false };
  }

  const lastInteractionDate = new Date(lastInteraction);
  const diffMinutes = Math.floor((now - lastInteractionDate) / (1000 * 60));

  if (diffMinutes >= 30) {
    // Session is idle for over 30 min, end it at the last interaction time
    activeSession.endedAt = lastInteractionDate;
    await activeSession.save();

    // If idle for more than 60 min, trigger forced logout
    if (diffMinutes >= 60) {
      return { session: null, timedOut: true };
    }

    return { session: null, timedOut: false };
  }

  return { session: activeSession, timedOut: false };
}

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

    // Update active session if exists
    const activeSession = await StudySession.findOne({
      where: { userId: req.user.id, endedAt: null },
      order: [['startedAt', 'DESC']]
    });

    if (activeSession) {
      activeSession.cardsReviewed = (activeSession.cardsReviewed || 0) + 1;
      if (correct) {
        activeSession.correctAnswers = (activeSession.correctAnswers || 0) + 1;
      }
      activeSession.xpEarned = (activeSession.xpEarned || 0) + (xpEarned || 0);
      // updatedAt is automatically updated by Sequelize
      await activeSession.save();
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
        // A "Not Yet" answer always moves the word back to In Progress,
        // regardless of prior correct answers. isKnown reflects the most
        // recent answer outcome so that Learned / In Progress / Not Started
        // counts on the Stats page stay accurate.
        progress.isKnown = false;
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
    }

    // Update streak
    const streak = gamification.updateStreak();

    // Check for achievements - get current achievements from database
    const currentAchievements = [...(gamification.unlockedAchievements || [])];
    const achievementsBeforeCount = currentAchievements.length;

    // 50 words learned achievement
    const learnedCount = await UserProgress.count({
      where: { userId: req.user.id, isKnown: true }
    });

    // Check for tiered achievements
    const userData = {
      correctCount: gamification.totalXp > 0 ? 1 : 0, // Simplified for first_correct
      learnedCount,
      streak,
      perfectSessions: gamification.perfectSessions || 0,
      totalXp: gamification.totalXp
    };

    const unlockedAwards = checkAchievements(userData, currentAchievements);

    if (unlockedAwards.length > 0) {
      for (const award of unlockedAwards) {
        currentAchievements.push(award.id);
        newAchievements.push(award.id);
        gamification.addXP(award.xp);
      }
    }

    // Save gamification changes (XP, level, streak)
    await gamification.save();

    // Update achievements using raw SQL to ensure JSONB persistence
    if (currentAchievements.length > achievementsBeforeCount) {
      console.log(`[Achievement] User ${req.user.id} unlocking:`, newAchievements);
      console.log(`[Achievement] Current array:`, currentAchievements);

      try {
        const [results, metadata] = await sequelize.query(
          'UPDATE user_gamification SET unlocked_achievements = $1::jsonb WHERE user_id = $2',
          {
            bind: [JSON.stringify(currentAchievements), req.user.id],
            type: sequelize.QueryTypes.UPDATE
          }
        );

        console.log(`[Achievement] SQL executed, rows affected:`, metadata?.rowCount || 0);

        // Reload to verify persistence
        await gamification.reload();
        console.log(`[Achievement] Verified in DB for user ${req.user.id}:`, gamification.unlockedAchievements);
      } catch (error) {
        console.error(`[Achievement] SQL ERROR for user ${req.user.id}:`, error);
        throw error;
      }
    } else {
      console.log(`[Achievement] No new achievements for user ${req.user.id}`);
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

// Get active session
router.get('/session/active', requireAuth, async (req, res) => {
  try {
    const { session, timedOut } = await cleanupStaleSession(req.user.id);

    if (!session) {
      return res.json({ session: null, timedOut });
    }

    res.json({
      timedOut,
      session: {
        id: session.id,
        mode: session.mode,
        startedAt: session.startedAt,
        cardsReviewed: session.cardsReviewed,
        correctAnswers: session.correctAnswers,
        xpEarned: session.xpEarned,
        updatedAt: session.updatedAt
      }
    });
  } catch (error) {
    console.error('Get active session error:', error);
    res.status(500).json({ error: 'Failed to get active session' });
  }
});

// Update session mode
router.patch('/session/:id/mode', requireAuth, async (req, res) => {
  try {
    const sessionId = req.params.id;
    const { mode } = req.body;

    if (!mode || !['practice', 'quiz', 'typing'].includes(mode)) {
      return res.status(400).json({ error: 'Invalid mode' });
    }

    const session = await StudySession.findOne({
      where: { id: sessionId, userId: req.user.id, endedAt: null }
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found or already ended' });
    }

    session.mode = mode;
    await session.save();

    res.json({ success: true });
  } catch (error) {
    console.error('Update session mode error:', error);
    res.status(500).json({ error: 'Failed to update session mode' });
  }
});

// Start study session
router.post('/session/start', requireAuth, async (req, res) => {
  try {
    const { mode } = req.body;

    // Cleanup any stale sessions before starting a new one
    await cleanupStaleSession(req.user.id);

    // Check if there's already an active session
    let existingSession = await StudySession.findOne({
      where: {
        userId: req.user.id,
        endedAt: null
      }
    });

    if (existingSession) {
      // Return the existing session instead of creating a new one
      return res.json({ session_id: existingSession.id });
    }

    const session = await StudySession.create({
      userId: req.user.id,
      mode: mode || 'practice',
      startedAt: new Date()
    });

    res.json({ session_id: session.id });
  } catch (error) {
    console.error('Start session error:', error);
    res.status(500).json({ error: 'Failed to start session' });
  }
});

// End study session
router.post('/session/:id/end', requireAuth, async (req, res) => {
  try {
    const sessionId = req.params.id;
    const { xpEarned, cardsReviewed, correctAnswers } = req.body;

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

    // Update user gamification
    const gamification = await UserGamification.findOne({
      where: { userId: req.user.id }
    });

    let levelUp = false;
    const newAchievements = [];

    if (gamification && xpEarned > 0) {
      const oldLevel = gamification.level;
      gamification.totalXp += xpEarned;

      // Simple level calculation: level = floor(sqrt(totalXp / 100))
      const newLevel = Math.floor(Math.sqrt(gamification.totalXp / 100)) + 1;
      if (newLevel > oldLevel) {
        gamification.level = newLevel;
        levelUp = true;
      }

      await gamification.save();
    }

    // Check for perfect session achievement (100% accuracy with at least 10 cards)
    if (gamification && cardsReviewed >= 10 && correctAnswers === cardsReviewed) {
      gamification.perfectSessions = (gamification.perfectSessions || 0) + 1;
      await gamification.save();

      const currentAchievements = [...(gamification.unlockedAchievements || [])];

      // Get learned count for achievement check
      const learnedCount = await UserProgress.count({
        where: { userId: req.user.id, isKnown: true }
      });

      const userData = {
        learnedCount,
        streak: gamification.dailyStreak,
        perfectSessions: gamification.perfectSessions,
        totalXp: gamification.totalXp
      };

      const unlockedAwards = checkAchievements(userData, currentAchievements);

      if (unlockedAwards.length > 0) {
        for (const award of unlockedAwards) {
          currentAchievements.push(award.id);
          newAchievements.push(award.id);

          // Award achievement XP bonus
          const oldLevel = gamification.level;
          gamification.totalXp += award.xp;
          const newLevel = Math.floor(Math.sqrt(gamification.totalXp / 100)) + 1;
          if (newLevel > oldLevel) {
            gamification.level = newLevel;
            levelUp = true;
          }
        }
        await gamification.save();

        // Persist achievements using raw SQL
        await sequelize.query(
          'UPDATE user_gamification SET unlocked_achievements = $1::jsonb WHERE user_id = $2',
          {
            bind: [JSON.stringify(currentAchievements), req.user.id],
            type: sequelize.QueryTypes.UPDATE
          }
        );
      }
    }

    res.json({
      xpEarned: xpEarned || 0,
      levelUp,
      newAchievements
    });
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
    const inProgressWords = allProgress.filter(p => !p.isKnown && p.reviewCount > 0).length;
    const accuracy = totalReviews > 0 ? Math.round((totalCorrect / (totalCorrect + totalIncorrect)) * 100) : 0;
    const lastStudy = allProgress.reduce((max, p) => {
      if (!p.lastReviewed) return max;
      const d = new Date(p.lastReviewed);
      return !max || d > max ? d : max;
    }, null);

    // Get total dynamic vocabulary count
    const totalWordsCount = await Vocabulary.count();

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
        totalWords: totalWordsCount,
        inProgressWords,
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

// Get student leaderboard (excludes admins)
router.get('/leaderboard', requireAuth, async (req, res) => {
  try {
    const { User } = require('../models');

    const leaderboard = await UserGamification.findAll({
      include: [{
        model: User,
        as: 'user',
        where: { role: 'student' },
        attributes: ['id', 'email']
      }],
      order: [[sequelize.col('total_xp'), 'DESC']],
      limit: 10
    });

    const formattedLeaderboard = await Promise.all(leaderboard.map(async (entry, index) => {
      // Fetch dynamic stats for each top user
      const progressStats = await UserProgress.findOne({
        where: { userId: entry.userId },
        attributes: [
          [sequelize.fn('COUNT', sequelize.literal('CASE WHEN is_known = true THEN 1 END')), 'wordsLearned'],
          [sequelize.fn('SUM', sequelize.col('correct_count')), 'totalCorrect'],
          [sequelize.fn('SUM', sequelize.col('incorrect_count')), 'totalIncorrect']
        ],
        raw: true
      });

      const totalCorrect = parseInt(progressStats?.totalCorrect) || 0;
      const totalIncorrect = parseInt(progressStats?.totalIncorrect) || 0;
      const totalReviews = totalCorrect + totalIncorrect;
      const accuracy = totalReviews > 0 ? Math.round((totalCorrect / totalReviews) * 100) : 0;
      const wordsLearned = parseInt(progressStats?.wordsLearned) || 0;

      return {
        rank: index + 1,
        username: entry.user.email.split('@')[0],
        totalXp: entry.totalXp,
        level: Math.floor(Math.sqrt(entry.totalXp / 100)) + 1,
        streak: entry.dailyStreak || 0,
        wordsLearned,
        accuracy
      };
    }));

    res.json({ leaderboard: formattedLeaderboard });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ error: 'Failed to get leaderboard' });
  }
});

// Get user achievements
router.get('/achievements', requireAuth, async (req, res) => {
  try {
    const gamification = await UserGamification.findOne({
      where: { userId: req.user.id }
    });

    const unlockedAchievements = gamification?.unlockedAchievements || [];

    // Get stats for achievement context
    const learnedCount = await UserProgress.count({
      where: { userId: req.user.id, isKnown: true }
    });

    const userData = {
      learnedCount,
      streak: gamification?.dailyStreak || 0,
      perfectSessions: gamification?.perfectSessions || 0,
      totalXp: gamification?.totalXp || 0
    };

    const allAchievements = getAllAchievementsStatus(unlockedAchievements, userData);

    res.json({ achievements: allAchievements });
  } catch (error) {
    console.error('Get achievements error:', error);
    res.status(500).json({ error: 'Failed to get achievements' });
  }
});

module.exports = router;
