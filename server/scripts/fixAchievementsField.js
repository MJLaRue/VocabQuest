// Load environment variables
require('dotenv').config();

const { sequelize } = require('../config/db');

/**
 * Migration script to fix unlocked_achievements JSONB field
 * 
 * This script:
 * 1. Sets all NULL unlocked_achievements to empty array []
 * 2. Ensures the field has a default value
 * 
 * Run once to clean up existing data and prevent NULL comparison issues
 */
async function fixAchievementsField() {
  try {
    console.log('Starting achievements field migration...');
    
    // Update all NULL values to empty array
    const [results, metadata] = await sequelize.query(`
      UPDATE user_gamification 
      SET unlocked_achievements = '[]'::jsonb 
      WHERE unlocked_achievements IS NULL
    `);
    
    console.log(`✓ Updated ${metadata.rowCount || 0} records with NULL achievements to []`);
    
    // Verify the update
    const [verifyResults] = await sequelize.query(`
      SELECT COUNT(*) as count 
      FROM user_gamification 
      WHERE unlocked_achievements IS NULL
    `);
    
    const nullCount = verifyResults[0].count;
    console.log(`✓ Verification: ${nullCount} records still have NULL (should be 0)`);
    
    // Show summary of current achievements
    const [summary] = await sequelize.query(`
      SELECT 
        user_id,
        unlocked_achievements,
        total_xp,
        level
      FROM user_gamification
      ORDER BY user_id
    `);
    
    console.log('\n=== Current Achievement Status ===');
    summary.forEach(user => {
      const achievements = user.unlocked_achievements || [];
      console.log(`User ${user.user_id}: Level ${user.level}, ${user.total_xp} XP, Achievements: ${achievements.length > 0 ? achievements.join(', ') : 'none'}`);
    });
    
    console.log('\n✅ Migration complete!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  fixAchievementsField()
    .then(() => {
      console.log('\nClosing database connection...');
      return sequelize.close();
    })
    .then(() => {
      console.log('Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = fixAchievementsField;
