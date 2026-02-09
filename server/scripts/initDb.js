require('dotenv').config();
const { sequelize } = require('../config/db');
const { User, Vocabulary, UserProgress, StudySession, UserGamification } = require('../models');

async function initDatabase() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('✓ Database connection established');
    
    console.log('Synchronizing models...');
    await sequelize.sync({ force: false, alter: true });
    console.log('✓ Database models synchronized');
    
    console.log('Database initialization complete!');
    process.exit(0);
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
}

initDatabase();
