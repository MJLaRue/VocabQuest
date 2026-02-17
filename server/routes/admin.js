const express = require('express');
const router = express.Router();
const multer = require('multer');
const { parse } = require('csv-parse/sync');
const { stringify } = require('csv-stringify/sync');
const { User, Vocabulary, UserProgress, StudySession, UserGamification } = require('../models');
const { requireAuth } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');
const { Op } = require('sequelize');

// Apply auth and admin middleware to all routes
router.use(requireAuth);
router.use(requireAdmin);

// Configure multer for CSV uploads
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files allowed'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// === USER MANAGEMENT ===

// Get all users
router.get('/users', async (req, res) => {
  try {
    const { search, role, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (search) {
      where.email = { [Op.iLike]: `%${search}%` };
    }
    if (role) {
      where.role = role;
    }

    const { count, rows: users } = await User.findAndCountAll({
      where,
      include: [{
        model: UserGamification,
        as: 'gamification'
      }],
      limit: parseInt(limit),
      offset,
      order: [['created_at', 'DESC']]
    });

    res.json({
      users: users.map(u => ({
        id: u.id,
        username: u.email.split('@')[0], // Derive username from email
        email: u.email,
        role: u.role,
        registrationSource: u.registrationSource,
        isEduVerified: u.isEduVerified,
        created_at: u.createdAt,
        last_login: u.lastLogin,
        level: u.gamification?.level || 1,
        total_xp: u.gamification?.totalXp || 0,
        dailyStreak: u.gamification?.dailyStreak || 0
      })),
      total: count,
      page: parseInt(page),
      pages: Math.ceil(count / limit)
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

// Create user (admin can bypass .edu restriction)
router.post('/users', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const existingUser = await User.findOne({ where: { email: email.toLowerCase() } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const user = await User.create({
      email: email.toLowerCase(),
      password,
      role: role || 'student',
      registrationSource: 'admin'
    });

    await UserGamification.create({ userId: user.id });

    res.status(201).json({ success: true, userId: user.id });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update user role
router.patch('/users/:id', async (req, res) => {
  try {
    const { role } = req.body;

    if (!['student', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.role = role;
    await user.save();

    res.json({ success: true });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Reset user password
router.post('/users/:id/reset-password', async (req, res) => {
  try {
    const { password } = req.body;

    if (!password || password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.password = password;
    await user.save();

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent deleting yourself
    if (user.id === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    await user.destroy();
    res.json({ success: true });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// === VOCABULARY MANAGEMENT ===

// Get all vocabulary
router.get('/vocab', async (req, res) => {
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

// Create vocabulary word
router.post('/vocab', async (req, res) => {
  try {
    const { word, partOfSpeech, definition } = req.body;

    if (!word || !partOfSpeech || !definition) {
      return res.status(400).json({ error: 'Word, part of speech, and definition required' });
    }

    const vocab = await Vocabulary.create({
      word: word.trim(),
      partOfSpeech: partOfSpeech.trim(),
      definition: definition.trim(),
      createdBy: req.user.id
    });

    res.status(201).json({ success: true, vocabId: vocab.id });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Word with this part of speech already exists' });
    }
    console.error('Create vocab error:', error);
    res.status(500).json({ error: 'Failed to create vocabulary' });
  }
});

// Upload CSV
router.post('/vocab/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const csvContent = req.file.buffer.toString('utf-8');
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    let imported = 0;
    let skipped = 0;
    const errors = [];

    for (const record of records) {
      try {
        if (!record.word || !record.part_of_speech || !record.definition) {
          skipped++;
          continue;
        }

        await Vocabulary.create({
          word: record.word.trim(),
          partOfSpeech: record.part_of_speech.trim(),
          definition: record.definition.trim(),
          createdBy: req.user.id
        });

        imported++;
      } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
          skipped++;
        } else {
          errors.push(`${record.word}: ${error.message}`);
        }
      }
    }

    res.json({ success: true, imported, skipped, errors });
  } catch (error) {
    console.error('Upload vocab error:', error);
    res.status(500).json({ error: 'Failed to upload vocabulary' });
  }
});

// Download CSV
router.get('/vocab/download', async (req, res) => {
  try {
    const vocab = await Vocabulary.findAll({
      order: [['word', 'ASC']]
    });

    const records = vocab.map(v => ({
      word: v.word,
      part_of_speech: v.partOfSpeech,
      definition: v.definition
    }));

    const csv = stringify(records, {
      header: true,
      columns: ['word', 'part_of_speech', 'definition']
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=vocabulary.csv');
    res.send(csv);
  } catch (error) {
    console.error('Download vocab error:', error);
    res.status(500).json({ error: 'Failed to download vocabulary' });
  }
});

// Update vocabulary word
router.put('/vocab/:id', async (req, res) => {
  try {
    const { word, partOfSpeech, definition } = req.body;

    const vocab = await Vocabulary.findByPk(req.params.id);
    if (!vocab) {
      return res.status(404).json({ error: 'Vocabulary not found' });
    }

    if (word) vocab.word = word.trim();
    if (partOfSpeech) vocab.partOfSpeech = partOfSpeech.trim();
    if (definition) vocab.definition = definition.trim();

    await vocab.save();

    res.json({ success: true });
  } catch (error) {
    console.error('Update vocab error:', error);
    res.status(500).json({ error: 'Failed to update vocabulary' });
  }
});

// Delete vocabulary word
router.delete('/vocab/:id', async (req, res) => {
  try {
    const vocab = await Vocabulary.findByPk(req.params.id);
    if (!vocab) {
      return res.status(404).json({ error: 'Vocabulary not found' });
    }

    await vocab.destroy();
    res.json({ success: true });
  } catch (error) {
    console.error('Delete vocab error:', error);
    res.status(500).json({ error: 'Failed to delete vocabulary' });
  }
});

// === STATISTICS ===

// Get dashboard stats (client-new format)
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalVocab = await Vocabulary.count();
    const totalSessions = await StudySession.count();

    // Active today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const activeToday = await User.count({
      where: {
        last_login: { [Op.gte]: today }
      }
    });

    res.json({
      totalUsers,
      totalWords: totalVocab,
      totalSessions,
      activeToday
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to get statistics' });
  }
});

// Get top students
router.get('/top-students', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const topStudents = await UserGamification.findAll({
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'email']
      }],
      order: [['total_xp', 'DESC']],
      limit: parseInt(limit)
    });

    // Get words learned and accuracy for each student
    const students = await Promise.all(topStudents.map(async (gamif) => {
      const progress = await UserProgress.findAll({
        where: { userId: gamif.userId }
      });

      const wordsLearned = progress.filter(p => p.correctCount >= 3).length;
      const totalAttempts = progress.reduce((sum, p) => sum + p.correctCount + p.incorrectCount, 0);
      const correctAttempts = progress.reduce((sum, p) => sum + p.correctCount, 0);
      const accuracy = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0;

      return {
        id: gamif.user.id,
        username: gamif.user.email.split('@')[0],
        level: gamif.level,
        total_xp: gamif.totalXp,
        words_learned: wordsLearned,
        accuracy
      };
    }));

    res.json({ students });
  } catch (error) {
    console.error('Get top students error:', error);
    res.status(500).json({ error: 'Failed to get top students' });
  }
});

// Vocabulary endpoint (alias for /vocab with different response format)
router.get('/vocabulary', async (req, res) => {
  try {
    const { search, deck, pos, limit = 50, offset = 0 } = req.query;

    const where = {};
    if (search) {
      where.word = { [Op.iLike]: `%${search}%` };
    }
    if (pos) {
      where.partOfSpeech = pos;
    }

    const { count, rows: vocab } = await Vocabulary.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['word', 'ASC']]
    });

    res.json({
      words: vocab.map(v => ({
        id: v.id,
        word: v.word,
        part_of_speech: v.partOfSpeech,
        definition: v.definition,
        example_sentence: v.exampleSentence || null,
        deck_name: v.deckName || null
      })),
      total: count
    });
  } catch (error) {
    console.error('Get vocabulary error:', error);
    res.status(500).json({ error: 'Failed to get vocabulary' });
  }
});

// Create vocabulary (matches /vocabulary endpoint)
router.post('/vocabulary', async (req, res) => {
  try {
    const { word, part_of_speech, definition, example_sentence, deck_name } = req.body;

    if (!word || !part_of_speech || !definition) {
      return res.status(400).json({ error: 'Word, part of speech, and definition required' });
    }

    const vocab = await Vocabulary.create({
      word: word.trim(),
      partOfSpeech: part_of_speech.trim(),
      definition: definition.trim(),
      exampleSentence: example_sentence?.trim(),
      deckName: deck_name?.trim(),
      createdBy: req.user.id
    });

    res.status(201).json({ id: vocab.id, message: 'Word created successfully' });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Word with this part of speech already exists' });
    }
    console.error('Create vocabulary error:', error);
    res.status(500).json({ error: 'Failed to create vocabulary' });
  }
});

// Update vocabulary (matches /vocabulary/:id endpoint)
router.patch('/vocabulary/:id', async (req, res) => {
  try {
    const { word, part_of_speech, definition, example_sentence, deck_name } = req.body;

    const vocab = await Vocabulary.findByPk(req.params.id);
    if (!vocab) {
      return res.status(404).json({ error: 'Vocabulary not found' });
    }

    if (word) vocab.word = word.trim();
    if (part_of_speech) vocab.partOfSpeech = part_of_speech.trim();
    if (definition) vocab.definition = definition.trim();
    if (example_sentence !== undefined) vocab.exampleSentence = example_sentence?.trim();
    if (deck_name !== undefined) vocab.deckName = deck_name?.trim();

    await vocab.save();

    res.json({ message: 'Word updated successfully' });
  } catch (error) {
    console.error('Update vocabulary error:', error);
    res.status(500).json({ error: 'Failed to update vocabulary' });
  }
});

// Delete vocabulary (matches /vocabulary/:id endpoint)
router.delete('/vocabulary/:id', async (req, res) => {
  try {
    const vocab = await Vocabulary.findByPk(req.params.id);
    if (!vocab) {
      return res.status(404).json({ error: 'Vocabulary not found' });
    }

    await vocab.destroy();
    res.json({ message: 'Word deleted successfully' });
  } catch (error) {
    console.error('Delete vocabulary error:', error);
    res.status(500).json({ error: 'Failed to delete vocabulary' });
  }
});

module.exports = router;
