const express = require('express');
const router = express.Router();
const { sequelize } = require('../config/db');
const { TestAttempt, Vocabulary, UserProgress, UserGamification } = require('../models');
const { requireAuth } = require('../middleware/auth');
const { calculateNextReview, correctnessToQuality } = require('../utils/spacedRepetition');
const { checkAchievements } = require('../utils/achievements');

const VALID_TEST_MODES = ['quiz', 'typing', 'context', 'relate'];

function getXpRate(mode, advanced) {
  if (mode === 'typing') return 15;
  if (mode === 'context' || mode === 'relate') return advanced ? 15 : 10;
  return 10; // quiz
}

/**
 * Calculate length bonus multiplier.
 * Linear from 1.0 at 10 questions to 1.5 at 100 questions.
 */
function calculateLengthBonus(questionCount) {
  return 1 + (Math.max(questionCount, 10) - 10) * 0.5 / 90;
}

/**
 * POST /test/start
 * Create a new test attempt with generated question sequence.
 */
router.post('/start', requireAuth, async (req, res) => {
  try {
    const { questionCount, modes, advanced = false } = req.body;

    // Validate
    if (!questionCount || questionCount < 10 || questionCount > 100) {
      return res.status(400).json({ error: 'Question count must be between 10 and 100' });
    }
    if (!modes || !Array.isArray(modes) || modes.length === 0) {
      return res.status(400).json({ error: 'At least one mode must be selected' });
    }
    if (!modes.every(m => VALID_TEST_MODES.includes(m))) {
      return res.status(400).json({ error: `Invalid mode. Allowed: ${VALID_TEST_MODES.join(', ')}` });
    }

    // Get words prioritized by spaced repetition (due for review first, then new/random)
    const vocab = await sequelize.query(`
      SELECT
        v.id,
        v.word,
        v.part_of_speech as "part_of_speech",
        v.definition,
        v.example_sentence as "example_sentence",
        v.synonyms,
        v.antonyms,
        COALESCE(up.next_review_date, NOW()) as next_review_date,
        CASE
          WHEN up.next_review_date IS NULL THEN 0
          WHEN up.next_review_date <= NOW() THEN 1
          ELSE 2
        END as priority
      FROM vocabulary v
      LEFT JOIN user_progress up ON v.id = up.vocab_id AND up.user_id = :userId
      ORDER BY
        priority ASC,
        next_review_date ASC,
        RANDOM()
      LIMIT :limit
    `, {
      replacements: { userId: req.user.id, limit: questionCount },
      type: sequelize.QueryTypes.SELECT
    });

    if (vocab.length < questionCount) {
      // If not enough words, just use what we have
      // (unlikely unless the DB has very few words)
    }

    // Assign modes in alternating round-robin pattern
    const questions = vocab.map((word, index) => ({
      vocabId: word.id,
      mode: modes[index % modes.length],
      correct: null,
      answeredAt: null
    }));

    // Build the full question data to return to the client (camelCase to match TestQuestion type)
    const questionsWithData = vocab.map((word, index) => ({
      index,
      vocabId: word.id,
      word: word.word,
      definition: word.definition,
      partOfSpeech: word.part_of_speech,
      exampleSentence: word.example_sentence || null,
      synonyms: word.synonyms || [],
      antonyms: word.antonyms || [],
      mode: modes[index % modes.length],
      correct: null,
      answeredAt: null
    }));

    // Create the test attempt
    const testAttempt = await TestAttempt.create({
      userId: req.user.id,
      config: { questionCount: vocab.length, modes, advanced },
      questions,
      status: 'in_progress'
    });

    res.json({
      testId: testAttempt.id,
      config: { questionCount: vocab.length, modes, advanced },
      questions: questionsWithData
    });
  } catch (error) {
    console.error('Start test error:', error);
    res.status(500).json({ error: 'Failed to start test' });
  }
});

/**
 * POST /test/answer
 * Record an individual answer during a test.
 */
router.post('/answer', requireAuth, async (req, res) => {
  try {
    const { testId, questionIndex, correct } = req.body;

    if (!testId || questionIndex === undefined || typeof correct !== 'boolean') {
      return res.status(400).json({ error: 'Invalid request data' });
    }

    const testAttempt = await TestAttempt.findOne({
      where: { id: testId, userId: req.user.id, status: 'in_progress' }
    });

    if (!testAttempt) {
      return res.status(404).json({ error: 'Test attempt not found' });
    }

    // Update the specific question in the JSONB array
    const questions = [...testAttempt.questions];
    if (questionIndex < 0 || questionIndex >= questions.length) {
      return res.status(400).json({ error: 'Invalid question index' });
    }

    questions[questionIndex] = {
      ...questions[questionIndex],
      correct,
      answeredAt: new Date().toISOString()
    };

    testAttempt.questions = questions;
    await testAttempt.save();

    // Also update UserProgress (spaced repetition) for this word
    const vocabId = questions[questionIndex].vocabId;
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
        progress.isKnown = false;
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
    }

    res.json({ success: true, questionIndex });
  } catch (error) {
    console.error('Test answer error:', error);
    res.status(500).json({ error: 'Failed to record answer' });
  }
});

/**
 * POST /test/:id/complete
 * Finalize a test, calculate XP with length bonus, and award to user.
 */
router.post('/:id/complete', requireAuth, async (req, res) => {
  try {
    const testAttempt = await TestAttempt.findOne({
      where: { id: req.params.id, userId: req.user.id, status: 'in_progress' }
    });

    if (!testAttempt) {
      return res.status(404).json({ error: 'Test attempt not found' });
    }

    const questions = testAttempt.questions;
    const advanced = testAttempt.config?.advanced ?? false;
    const startedAt = new Date(testAttempt.startedAt).getTime();
    const now = Date.now();
    const durationMs = now - startedAt;
    const totalQuestions = questions.length;

    // Calculate results per mode
    const byMode = {};
    let totalCorrect = 0;
    let baseXP = 0;

    for (const q of questions) {
      if (!byMode[q.mode]) {
        byMode[q.mode] = { correct: 0, total: 0, xpEarned: 0 };
      }
      byMode[q.mode].total += 1;

      if (q.correct === true) {
        const qXp = getXpRate(q.mode, advanced);
        byMode[q.mode].correct += 1;
        totalCorrect += 1;
        baseXP += qXp;
        byMode[q.mode].xpEarned += qXp;
      }
    }

    // Add accuracy per mode
    for (const mode of Object.keys(byMode)) {
      const m = byMode[mode];
      m.accuracy = m.total > 0 ? Math.round((m.correct / m.total) * 100) : 0;
    }

    // Apply length bonus
    const lengthBonusMultiplier = calculateLengthBonus(totalQuestions);
    const totalXP = Math.round(baseXP * lengthBonusMultiplier);

    // Apply length bonus XP scaling to byMode xpEarned
    for (const mode of Object.keys(byMode)) {
      byMode[mode].xpEarned = Math.round(byMode[mode].xpEarned * lengthBonusMultiplier);
    }

    const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

    // Normalized results shape matching client expectations
    const results = {
      score: totalCorrect,
      total: totalQuestions,
      accuracy,
      xpEarned: totalXP,
      lengthBonus: parseFloat(lengthBonusMultiplier.toFixed(2)),
      byMode,
      duration: durationMs
    };

    // Update test attempt
    testAttempt.results = results;
    testAttempt.completedAt = new Date();
    testAttempt.xpEarned = totalXP;
    testAttempt.status = 'completed';
    await testAttempt.save();

    // Award XP to gamification
    let gamification = await UserGamification.findOne({
      where: { userId: req.user.id }
    });

    if (!gamification) {
      gamification = await UserGamification.create({ userId: req.user.id });
    }

    let didLevelUp = false;
    let newLevel = gamification.level;
    let newAchievements = [];

    if (totalXP > 0) {
      const xpResult = gamification.addXP(totalXP);
      didLevelUp = xpResult.leveledUp;
      newLevel = xpResult.newLevel;
    }

    // Check for perfect test
    if (totalCorrect === totalQuestions) {
      gamification.perfectSessions = (gamification.perfectSessions || 0) + 1;
    }

    // Update streak
    gamification.updateStreak();

    // Check for achievements
    const currentAchievements = [...(gamification.unlockedAchievements || [])];
    const learnedCount = await UserProgress.count({
      where: { userId: req.user.id, isKnown: true }
    });

    // Count completed tests for test_taker and test_ace achievements
    const testsCompleted = await TestAttempt.count({
      where: { userId: req.user.id, status: 'completed' }
    });
    const allCompletedTests = await TestAttempt.findAll({
      where: { userId: req.user.id, status: 'completed' },
      attributes: ['results']
    });
    const highScoreTests = allCompletedTests.filter(
      t => (t.results?.accuracy ?? 0) >= 90
    ).length;

    const { checkAchievements: checkAch } = require('../utils/achievements');
    const userData = {
      correctCount: 1,
      learnedCount,
      streak: gamification.dailyStreak || 0,
      perfectSessions: gamification.perfectSessions || 0,
      totalXp: gamification.totalXp,
      testsCompleted,
      highScoreTests
    };

    const unlockedAwards = checkAch(userData, currentAchievements);
    if (unlockedAwards.length > 0) {
      for (const award of unlockedAwards) {
        currentAchievements.push(award.id);
        newAchievements.push(award);  // push full object {id, name, level, xp}
        gamification.addXP(award.xp);
      }
      // Persist the updated list — without this, achievements show in the
      // completion response but are never saved to the DB.
      gamification.unlockedAchievements = currentAchievements;
    }

    await gamification.save();

    res.json({
      results,
      gamification: {
        totalXp: gamification.totalXp,
        level: newLevel,
        didLevelUp,
        newAchievements
      }
    });
  } catch (error) {
    console.error('Complete test error:', error);
    res.status(500).json({ error: 'Failed to complete test' });
  }
});

/**
 * GET /test/history
 * Get the current user's test history.
 */
router.get('/history', requireAuth, async (req, res) => {
  try {
    const tests = await TestAttempt.findAll({
      where: { userId: req.user.id },
      order: [['startedAt', 'DESC']],
      limit: 50
    });

    res.json({
      attempts: tests.map(t => ({
        id: t.id,
        startedAt: t.startedAt,
        completedAt: t.completedAt,
        config: t.config,
        results: t.results,
        xpEarned: t.xpEarned,
        status: t.status
      }))
    });
  } catch (error) {
    console.error('Test history error:', error);
    res.status(500).json({ error: 'Failed to get test history' });
  }
});

/**
 * GET /test/:id
 * Get a single test attempt detail, with vocabulary data joined in.
 */
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const test = await TestAttempt.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }

    // Enrich questions with vocabulary data — degrade gracefully if it fails
    const rawQuestions = test.questions || [];
    let enrichedQuestions = rawQuestions;

    try {
      const vocabIds = rawQuestions.map(q => q.vocabId).filter(Boolean);

      if (vocabIds.length > 0) {
        // Use IN (:ids) — Sequelize expands arrays for IN clauses natively
        const vocabRows = await sequelize.query(`
          SELECT id, word, definition,
                 part_of_speech AS "partOfSpeech",
                 example_sentence AS "exampleSentence",
                 synonyms, antonyms
          FROM vocabulary
          WHERE id IN (:ids)
        `, {
          replacements: { ids: vocabIds },
          type: sequelize.QueryTypes.SELECT
        });
        const vocabMap = Object.fromEntries(vocabRows.map(v => [v.id, v]));

        enrichedQuestions = rawQuestions.map(q => ({
          vocabId:         q.vocabId,
          mode:            q.mode,
          correct:         q.correct,
          answeredAt:      q.answeredAt,
          word:            vocabMap[q.vocabId]?.word            ?? null,
          definition:      vocabMap[q.vocabId]?.definition      ?? null,
          partOfSpeech:    vocabMap[q.vocabId]?.partOfSpeech    ?? null,
          exampleSentence: vocabMap[q.vocabId]?.exampleSentence ?? null,
          synonyms:        vocabMap[q.vocabId]?.synonyms        ?? [],
          antonyms:        vocabMap[q.vocabId]?.antonyms        ?? [],
        }));
      }
    } catch (enrichErr) {
      console.error('Vocab enrichment failed (returning raw questions):', enrichErr);
      // enrichedQuestions stays as rawQuestions — scores/results still load correctly
    }

    res.json({
      attempt: {
        id: test.id,
        startedAt: test.startedAt,
        completedAt: test.completedAt,
        config: test.config,
        results: test.results,
        questions: enrichedQuestions,
        xpEarned: test.xpEarned,
        status: test.status
      }
    });
  } catch (error) {
    console.error('Get test error:', error);
    res.status(500).json({ error: 'Failed to get test' });
  }
});

module.exports = router;
