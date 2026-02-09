const express = require('express');
const router = express.Router();
const { Vocabulary } = require('../models');
const { requireAuth } = require('../middleware/auth');

// Get all vocabulary words
router.get('/', requireAuth, async (req, res) => {
  try {
    const vocab = await Vocabulary.findAll({
      order: [['word', 'ASC']]
    });
    
    res.json({ vocab });
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

module.exports = router;
