const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Vocabulary = sequelize.define('Vocabulary', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  word: {
    type: DataTypes.STRING,
    allowNull: false
  },
  partOfSpeech: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'part_of_speech'
  },
  definition: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'created_by',
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'vocabulary',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['word', 'part_of_speech']
    }
  ]
});

module.exports = Vocabulary;
