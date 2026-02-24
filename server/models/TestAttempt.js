const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const TestAttempt = sequelize.define('TestAttempt', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  startedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'started_at'
  },
  completedAt: {
    type: DataTypes.DATE,
    field: 'completed_at'
  },
  config: {
    type: DataTypes.JSONB,
    allowNull: false
    // { questionCount: number, modes: string[] }
  },
  results: {
    type: DataTypes.JSONB,
    defaultValue: null
    // { totalCorrect, totalQuestions, scoreByMode, xpEarned, lengthBonus, baseXP }
  },
  questions: {
    type: DataTypes.JSONB,
    allowNull: false
    // Array of { vocabId, mode, correct: boolean|null, answeredAt: string|null }
  },
  xpEarned: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'xp_earned'
  },
  status: {
    type: DataTypes.ENUM('in_progress', 'completed', 'abandoned'),
    defaultValue: 'in_progress'
  }
}, {
  tableName: 'test_attempts',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = TestAttempt;
