const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const StudySession = sequelize.define('StudySession', {
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
  endedAt: {
    type: DataTypes.DATE,
    field: 'ended_at'
  },
  xpEarned: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'xp_earned'
  },
  cardsReviewed: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'cards_reviewed'
  },
  correctAnswers: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'correct_answers'
  },
  mode: {
    type: DataTypes.ENUM('practice', 'quiz', 'typing'),
    allowNull: false
  }
}, {
  tableName: 'study_sessions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = StudySession;
