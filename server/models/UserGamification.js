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
    field: 'unlocked_achievements'
  }
}, {
  tableName: 'user_gamification',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Helper method to calculate XP needed for next level
UserGamification.getXPForLevel = function(level) {
  return Math.floor(100 * Math.pow(1.5, level - 1));
};

// Instance method to add XP and handle level ups
UserGamification.prototype.addXP = function(amount) {
  this.totalXp += amount;
  
  let leveledUp = false;
  let xpNeeded = UserGamification.getXPForLevel(this.level);
  
  while (this.totalXp >= xpNeeded) {
    this.totalXp -= xpNeeded;
    this.level++;
    leveledUp = true;
    xpNeeded = UserGamification.getXPForLevel(this.level);
  }
  
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
