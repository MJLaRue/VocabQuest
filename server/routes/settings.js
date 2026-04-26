const express = require('express');
const router = express.Router();
const { AppSetting } = require('../models');
const { Op } = require('sequelize');

// No authentication required — all routes in this file are public.
// Do NOT add authenticated endpoints here; use server/routes/admin.js instead.

const PUBLIC_KEYS = ['announcementText', 'leaderboardVisible', 'defaultCardsPerSession', 'maintenanceMode'];

const DEFAULTS = {
  announcementText: '',
  leaderboardVisible: 'true',
  defaultCardsPerSession: '20',
  maintenanceMode: 'false',
};

router.get('/public', async (req, res) => {
  try {
    const rows = await AppSetting.findAll({ where: { key: { [Op.in]: PUBLIC_KEYS } } });
    const settings = { ...DEFAULTS };
    for (const row of rows) {
      settings[row.key] = row.value;
    }
    res.json({ settings });
  } catch (error) {
    console.error('Get public settings error:', error);
    res.json({ settings: DEFAULTS }); // fail open
  }
});

module.exports = router;
