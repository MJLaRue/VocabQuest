const express = require('express');
const router = express.Router();
const { Vocabulary, UserProgress } = require('../models');
const { requireAuth } = require('../middleware/auth');
const { sequelize } = require('../config/db');
const { Op } = require('sequelize');

// Get vocabulary words with filters
router.get('/words', requireAuth, async (req, res) => {
  try {
    const { deck, pos, search, limit = 20, offset = 0 } = req.query;

    const where = {};
    if (pos) {
      where.partOfSpeech = pos;
    }
    if (search) {
      where[Op.or] = [
        { word: { [Op.iLike]: `%${search}%` } },
        { definition: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows: words } = await Vocabulary.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['word', 'ASC']]
    });

    res.json({
      words: words.map(w => ({
        id: w.id,
        word: w.word,
        part_of_speech: w.partOfSpeech,
        definition: w.definition,
        example_sentence: null,
        deck_name: null
      })),
      total: count
    });
  } catch (error) {
    console.error('Get words error:', error);
    res.status(500).json({ error: 'Failed to get words' });
  }
});

// Get available decks (not implemented yet - return empty)
router.get('/decks', requireAuth, async (req, res) => {
  try {
    res.json({ decks: [] });
  } catch (error) {
    console.error('Get decks error:', error);
    res.status(500).json({ error: 'Failed to get decks' });
  }
});

// Get random words
router.get('/random', requireAuth, async (req, res) => {
  try {
    const { pos, limit = 20 } = req.query;

    const where = {};
    if (pos) {
      where.partOfSpeech = pos;
    }

    const words = await Vocabulary.findAll({
      where,
      order: sequelize.random(),
      limit: parseInt(limit)
    });

    res.json({
      words: words.map(w => ({
        id: w.id,
        word: w.word,
        part_of_speech: w.partOfSpeech,
        definition: w.definition,
        example_sentence: null,
        deck_name: null
      }))
    });
  } catch (error) {
    console.error('Get random words error:', error);
    res.status(500).json({ error: 'Failed to get random words' });
  }
});

// Get all vocabulary words
router.get('/', requireAuth, async (req, res) => {
  try {
    const vocab = await Vocabulary.findAll({
      order: [['word', 'ASC']]
    });

    res.json({ vocabulary: vocab });
  } catch (error) {
    console.error('Get vocab error:', error);
    res.status(500).json({ error: 'Failed to get vocabulary' });
  }
});

// Get single vocabulary word
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const vocab = await Vocabulary.findByPk(req.params.id);

    if (!vocab) {
      return res.status(404).json({ error: 'Vocabulary not found' });
    }

    res.json({ vocab });
  } catch (error) {
    console.error('Get vocab error:', error);
    res.status(500).json({ error: 'Failed to get vocabulary' });
  }
});

// Get vocabulary with spaced repetition priority
router.get('/smart/prioritized', requireAuth, async (req, res) => {
  try {
    // Get all vocabulary with user progress
    const vocab = await sequelize.query(`
      SELECT 
        v.id,
        v.word,
        v.part_of_speech as "partOfSpeech",
        v.definition,
        v.created_by as "createdBy",
        v.created_at as "createdAt",
        v.updated_at as "updatedAt",
        COALESCE(up.next_review_date, NOW()) as next_review_date,
        COALESCE(up.review_count, 0) as review_count,
        COALESCE(up.ease_factor, 2.5) as ease_factor,
        COALESCE(up.correct_count, 0) as correct_count,
        COALESCE(up.incorrect_count, 0) as incorrect_count,
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
        review_count ASC,
        v.word ASC
    `, {
      replacements: { userId: req.user.id },
      type: sequelize.QueryTypes.SELECT
    });

    res.json({
      vocabulary: vocab,
      dueCount: vocab.filter(v => v.priority <= 1).length
    });
  } catch (error) {
    console.error('Get smart vocab error:', error);
    res.status(500).json({ error: 'Failed to get vocabulary' });
  }
});

module.exports = router;
