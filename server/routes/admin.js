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
        createdAt: u.createdAt,
        lastLogin: u.lastLogin,
        level: u.gamification?.level || 1,
        totalXp: u.gamification?.totalXp || 0,
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

// Get dashboard stats
router.get('/stats', async (req, res) => {
  try {
    // User stats
    const totalUsers = await User.count();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const activeUsers7d = await User.count({
      where: {
        last_login: { [Op.gte]: sevenDaysAgo }
      }
    });
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newUsers30d = await User.count({
      where: {
        created_at: { [Op.gte]: thirtyDaysAgo }
      }
    });
    
    // Vocab stats
    const totalVocab = await Vocabulary.count();
    
    // Gamification stats
    const gamificationStats = await UserGamification.findAll({
      attributes: [
        [require('sequelize').fn('AVG', require('sequelize').col('level')), 'avgLevel'],
        [require('sequelize').fn('AVG', require('sequelize').col('total_xp')), 'avgXP'],
        [require('sequelize').fn('SUM', require('sequelize').col('total_xp')), 'totalXP']
      ]
    });
    
    const avgLevel = Math.round(gamificationStats[0]?.dataValues?.avgLevel || 1);
    const avgXP = Math.round(gamificationStats[0]?.dataValues?.avgXP || 0);
    const totalXP = parseInt(gamificationStats[0]?.dataValues?.totalXP || 0);
    
    // Mode breakdown
    const sessions = await StudySession.findAll({
      attributes: [
        'mode',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      group: ['mode']
    });
    
    const modeBreakdown = {};
    sessions.forEach(s => {
      modeBreakdown[s.mode] = parseInt(s.dataValues.count);
    });
    
    // Leaderboard
    const topXP = await UserGamification.findAll({
      include: [{
        model: User,
        as: 'user',
        attributes: ['email']
      }],
      order: [['total_xp', 'DESC']],
      limit: 10
    });
    
    const topStreak = await UserGamification.findAll({
      include: [{
        model: User,
        as: 'user',
        attributes: ['email']
      }],
      order: [['daily_streak', 'DESC']],
      limit: 10
    });
    
    res.json({
      users: {
        total: totalUsers,
        active7d: activeUsers7d,
        new30d: newUsers30d
      },
      vocab: {
        total: totalVocab
      },
      gamification: {
        avgLevel,
        avgXP,
        totalXP
      },
      modeBreakdown,
      leaderboard: {
        topXP: topXP.map(g => ({
          email: g.user.email,
          xp: g.totalXp,
          level: g.level
        })),
        topStreak: topStreak.map(g => ({
          email: g.user.email,
          streak: g.dailyStreak,
          level: g.level
        }))
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to get statistics' });
  }
});

module.exports = router;
