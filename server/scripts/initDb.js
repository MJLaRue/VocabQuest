require('dotenv').config();
const { sequelize } = require('../config/db');
const { User, Vocabulary, UserProgress, StudySession, UserGamification, TestAttempt, AppSetting } = require('../models');

async function initDatabase() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('✓ Database connection established');

    // Extend study_sessions mode ENUM before Sequelize sync.
    // sequelize.sync({ alter: true }) cannot add values to existing PostgreSQL ENUMs,
    // so we do it manually with ADD VALUE IF NOT EXISTS (safe to run multiple times).
    console.log('Extending study_sessions mode ENUM...');
    try {
      await sequelize.query(`ALTER TYPE "enum_study_sessions_mode" ADD VALUE IF NOT EXISTS 'context'`);
      await sequelize.query(`ALTER TYPE "enum_study_sessions_mode" ADD VALUE IF NOT EXISTS 'match'`);
      console.log('✓ ENUM extended with context and match modes');
    } catch (err) {
      // ENUM may not exist yet (fresh DB) — sync will create it correctly from the model
      console.log('  ENUM extension skipped (will be created by sync):', err.message);
    }

    // Extend test_attempts status ENUM
    console.log('Extending test_attempts status ENUM...');
    try {
      await sequelize.query(`ALTER TYPE "enum_test_attempts_status" ADD VALUE IF NOT EXISTS 'abandoned'`);
      console.log('✓ test_attempts status ENUM extended');
    } catch (err) {
      console.log('  test_attempts status ENUM skipped (will be created by sync):', err.message);
    }

    console.log('Synchronizing models...');
    await sequelize.sync({ force: false, alter: true });
    console.log('✓ Database models synchronized');

    // Seed default app settings (idempotent — findOrCreate)
    const defaultSettings = [
      { key: 'registrationOpen',       value: 'true'  },
      { key: 'announcementText',        value: ''      },
      { key: 'leaderboardVisible',      value: 'true'  },
      { key: 'allowEduRegistration',    value: 'true'  },
      { key: 'defaultCardsPerSession',  value: '20'    },
      { key: 'maintenanceMode',         value: 'false' },
    ];
    for (const setting of defaultSettings) {
      await AppSetting.findOrCreate({ where: { key: setting.key }, defaults: { value: setting.value } });
    }
    console.log('✓ Default app settings seeded');

    console.log('Database initialization complete!');
    process.exit(0);
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
}

initDatabase();
