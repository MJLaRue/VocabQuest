const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const UserGamification = sequelize.define('UserGamification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  totalXp: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'total_xp'
  },
  level: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  dailyStreak: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'daily_streak'
  },
  lastVisitDate: {
    type: DataTypes.DATEONLY,
    field: 'last_visit_date'
  },
  unlockedAchievements: {
    type: DataTypes.JSONB,
    defaultValue: [],
    field: 'unlocked_achievements',
    get() {
      // Ensure NULL values are treated as empty array
      const value = this.getDataValue('unlockedAchievements');
      return value || [];
    }
  }
}, {
  tableName: 'user_gamification',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Instance method to add XP and handle level ups using quadratic cumulative formula
// Level = floor(sqrt(totalXp / 100)) + 1
// This means XP is never subtracted, only accumulated
UserGamification.prototype.addXP = function(amount) {
  const oldLevel = Math.floor(Math.sqrt(this.totalXp / 100)) + 1;
  this.totalXp += amount;
  const newLevel = Math.floor(Math.sqrt(this.totalXp / 100)) + 1;
  
  const leveledUp = newLevel > oldLevel;
  this.level = newLevel; // Keep level in sync with actual formula
  
  return { leveledUp, newLevel: this.level };
};

// Instance method to update streak
UserGamification.prototype.updateStreak = function() {
  const today = new Date().toISOString().split('T')[0];
  
  if (this.lastVisitDate === today) {
    // Already visited today, no change
    return this.dailyStreak;
  }
  
  if (this.lastVisitDate) {
    const lastDate = new Date(this.lastVisitDate);
    const todayDate = new Date(today);
    const diffDays = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      // Consecutive day
      this.dailyStreak++;
    } else {
      // Streak broken
      this.dailyStreak = 1;
    }
  } else {
    // First visit
    this.dailyStreak = 1;
  }
  
  this.lastVisitDate = today;
  return this.dailyStreak;
};

module.exports = UserGamification;
