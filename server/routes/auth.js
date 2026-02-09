const express = require('express');
const router = express.Router();
const { User, UserGamification } = require('../models');
const { requireAuth } = require('../middleware/auth');

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }
    
    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      return res.status(400).json({ 
        error: 'Password must contain at least one uppercase letter and one number' 
      });
    }
    
    // Check if .edu email or pre-registered
    const isEduEmail = email.toLowerCase().endsWith('.edu');
    const existingUser = await User.findOne({ where: { email: email.toLowerCase() } });
    
    if (existingUser) {
      if (existingUser.password) {
        return res.status(400).json({ error: 'Email already registered' });
      }
      // Pre-registered by admin, update password
      existingUser.password = password;
      await existingUser.save();
      
      return res.json({ 
        success: true, 
        message: 'Registration complete',
        userId: existingUser.id 
      });
    }
    
    if (!isEduEmail) {
      return res.status(403).json({ 
        error: 'Registration restricted to .edu email addresses. Contact an administrator for access.' 
      });
    }
    
    // Create user
    const user = await User.create({
      email: email.toLowerCase(),
      password,
      role: 'student'
    });
    
    // Create gamification record
    await UserGamification.create({
      userId: user.id
    });
    
    res.status(201).json({ 
      success: true, 
      message: 'Registration successful',
      userId: user.id 
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    
    const user = await User.findOne({ 
      where: { email: email.toLowerCase() },
      include: [{
        model: UserGamification,
        as: 'gamification'
      }]
    });
    
    if (!user || !user.password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    const isValid = await user.comparePassword(password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    
    // Update streak
    if (user.gamification) {
      user.gamification.updateStreak();
      await user.gamification.save();
    }
    
    // Set session
    req.session.userId = user.id;
    req.session.role = user.role;
    
    res.json({ 
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        level: user.gamification?.level || 1,
        totalXp: user.gamification?.totalXp || 0,
        dailyStreak: user.gamification?.dailyStreak || 0
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ success: true });
  });
});

// Get current user
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [{
        model: UserGamification,
        as: 'gamification'
      }]
    });
    
    res.json({ 
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        level: user.gamification?.level || 1,
        totalXp: user.gamification?.totalXp || 0,
        dailyStreak: user.gamification?.dailyStreak || 0,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

module.exports = router;
