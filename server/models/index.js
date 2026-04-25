const User = require('./User');
const Vocabulary = require('./Vocabulary');
const UserProgress = require('./UserProgress');
const StudySession = require('./StudySession');
const UserGamification = require('./UserGamification');
const TestAttempt = require('./TestAttempt');
const AppSetting = require('./AppSetting');

// Define associations
User.hasMany(UserProgress, { foreignKey: 'userId', as: 'progress' });
User.hasMany(StudySession, { foreignKey: 'userId', as: 'sessions' });
User.hasOne(UserGamification, { foreignKey: 'userId', as: 'gamification' });
User.hasMany(TestAttempt, { foreignKey: 'userId', as: 'testAttempts' });

Vocabulary.hasMany(UserProgress, { foreignKey: 'vocabId', as: 'userProgress' });

UserProgress.belongsTo(User, { foreignKey: 'userId', as: 'user' });
UserProgress.belongsTo(Vocabulary, { foreignKey: 'vocabId', as: 'vocabulary' });

StudySession.belongsTo(User, { foreignKey: 'userId', as: 'user' });

UserGamification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

TestAttempt.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = {
  User,
  Vocabulary,
  UserProgress,
  StudySession,
  UserGamification,
  TestAttempt,
  AppSetting
};
