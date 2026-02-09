const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const UserProgress = sequelize.define('UserProgress', {
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
  vocabId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'vocab_id',
    references: {
      model: 'vocabulary',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  isKnown: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_known'
  },
  lastReviewed: {
    type: DataTypes.DATE,
    field: 'last_reviewed'
  },
  reviewCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'review_count'
  },
  correctCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'correct_count'
  },
  incorrectCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'incorrect_count'
  },
  nextReviewDate: {
    type: DataTypes.DATE,
    field: 'next_review_date',
    defaultValue: DataTypes.NOW
  },
  easeFactor: {
    type: DataTypes.FLOAT,
    defaultValue: 2.5,
    field: 'ease_factor'
  },
  reviewInterval: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'review_interval',
    comment: 'Days until next review'
  }
}, {
  tableName: 'user_progress',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'vocab_id']
    }
  ]
});

module.exports = UserProgress;
