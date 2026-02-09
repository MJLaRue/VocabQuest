require('dotenv').config();
const { sequelize } = require('../config/db');

async function addSpacedRepetitionColumns() {
  try {
    console.log('Adding spaced repetition columns to user_progress table...');
    
    // Add next_review_date column
    await sequelize.query(`
      ALTER TABLE user_progress 
      ADD COLUMN IF NOT EXISTS next_review_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    `);
    console.log('✓ Added next_review_date column');
    
    // Add ease_factor column (SM-2 algorithm factor, default 2.5)
    await sequelize.query(`
      ALTER TABLE user_progress 
      ADD COLUMN IF NOT EXISTS ease_factor FLOAT DEFAULT 2.5;
    `);
    console.log('✓ Added ease_factor column');
    
    // Add review_interval column (days until next review)
    await sequelize.query(`
      ALTER TABLE user_progress 
      ADD COLUMN IF NOT EXISTS review_interval INTEGER DEFAULT 0;
    `);
    console.log('✓ Added review_interval column');
    
    console.log('\n✅ Successfully added spaced repetition columns!');
    console.log('You can now use the spaced repetition algorithm.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding columns:', error);
    process.exit(1);
  }
}

addSpacedRepetitionColumns();
